/**
 * Скрипт миграции данных из Event в Page
 * 
 * Выполняет:
 * 1. Создание дефолтных страниц (slug=null) для пользователей с существующими блоками
 * 2. Конвертацию всех Event в Page
 * 3. Перенос блоков с event_id на page_id
 * 
 * Запуск: npx ts-node scripts/migrate-events-to-pages.ts
 */

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Загружаем переменные окружения
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'biohub',
  entities: [path.join(__dirname, '../backend/src/**/*.entity{.ts,.js}')],
  synchronize: false,
});

async function migrate() {
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // 1. Создаем таблицу pages если её нет
    console.log('Creating pages table if not exists...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR,
        title VARCHAR NOT NULL,
        description TEXT,
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("userId", slug)
      );
    `);

    // 2. Создаем таблицу page_views если её нет
    console.log('Creating page_views table if not exists...');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS page_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "pageId" UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
        "viewedAt" TIMESTAMP DEFAULT NOW(),
        "ipAddress" VARCHAR
      );
      CREATE INDEX IF NOT EXISTS idx_page_views_page_viewed ON page_views("pageId", "viewedAt");
    `);

    // 3. Добавляем колонку pageId в blocks если её нет
    console.log('Adding pageId column to blocks if not exists...');
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='blocks' AND column_name='pageId'
        ) THEN
          ALTER TABLE blocks ADD COLUMN "pageId" UUID REFERENCES pages(id) ON DELETE CASCADE;
        END IF;
      END $$;
    `);

    // 4. Создаем дефолтные страницы для пользователей с блоками без eventId
    console.log('Creating default pages for users with blocks...');
    await queryRunner.query(`
      INSERT INTO pages (id, slug, title, description, "userId", "createdAt", "updatedAt")
      SELECT 
        gen_random_uuid(),
        NULL,
        'Главная страница',
        'Моя главная страница',
        b."userId",
        MIN(b."createdAt"),
        MAX(b."updatedAt")
      FROM blocks b
      WHERE b."eventId" IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM pages p 
          WHERE p."userId" = b."userId" AND p.slug IS NULL
        )
      GROUP BY b."userId"
      ON CONFLICT DO NOTHING;
    `);

    // 5. Конвертируем все Event в Page
    console.log('Converting Events to Pages...');
    await queryRunner.query(`
      INSERT INTO pages (id, slug, title, description, "userId", "createdAt", "updatedAt")
      SELECT 
        id,
        slug,
        title,
        description,
        "userId",
        "createdAt",
        "updatedAt"
      FROM events
      WHERE NOT EXISTS (
        SELECT 1 FROM pages p 
        WHERE p.id = events.id
      )
      ON CONFLICT DO NOTHING;
    `);

    // 6. Обновляем блоки: переносим с eventId на pageId
    console.log('Migrating blocks from eventId to pageId...');
    
    // Блоки без eventId -> дефолтная страница (slug=null)
    await queryRunner.query(`
      UPDATE blocks b
      SET "pageId" = (
        SELECT p.id 
        FROM pages p 
        WHERE p."userId" = b."userId" AND p.slug IS NULL
        LIMIT 1
      )
      WHERE b."eventId" IS NULL AND b."pageId" IS NULL;
    `);

    // Блоки с eventId -> соответствующая страница
    await queryRunner.query(`
      UPDATE blocks b
      SET "pageId" = (
        SELECT p.id 
        FROM pages p 
        WHERE p.id = b."eventId"
        LIMIT 1
      )
      WHERE b."eventId" IS NOT NULL AND b."pageId" IS NULL;
    `);

    console.log('Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify data in pages and blocks tables');
    console.log('2. After verification, you can drop the eventId column from blocks:');
    console.log('   ALTER TABLE blocks DROP COLUMN IF EXISTS "eventId";');
    console.log('3. You can drop the events table if no longer needed:');
    console.log('   DROP TABLE IF EXISTS events CASCADE;');

    await queryRunner.release();
    await dataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();


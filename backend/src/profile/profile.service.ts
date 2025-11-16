import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findProfileByUserId(userId: string): Promise<UserProfile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      // Создаем профиль, если его нет
      const newProfile = this.profileRepository.create({
        user: { id: userId } as any,
      });
      return await this.profileRepository.save(newProfile);
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile> {
    let profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      profile = this.profileRepository.create({
        user: { id: userId } as any,
      });
    }

    // Обновляем username в User, если он указан
    if (updateProfileDto.username !== undefined) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (user) {
        user.username = updateProfileDto.username;
        await this.userRepository.save(user);
      }
    }

    // Удаляем username из DTO перед обновлением профиля
    const { username, ...profileData } = updateProfileDto;
    Object.assign(profile, profileData);
    return await this.profileRepository.save(profile);
  }

  async findProfileByEmail(email: string): Promise<UserProfile | null> {
    return await this.profileRepository.findOne({
      where: { user: { email } },
      relations: ['user'],
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }
}


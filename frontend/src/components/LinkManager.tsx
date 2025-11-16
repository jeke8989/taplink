import React from 'react';
import { Link } from '../api/profile';

interface LinkManagerProps {
  links: Link[];
  onChange: (links: Link[]) => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({ links, onChange }) => {
  const addLink = () => {
    onChange([...links, { title: '', url: '' }]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: keyof Link, value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Ссылки
        </label>
        <button
          type="button"
          onClick={addLink}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + Добавить ссылку
        </button>
      </div>

      {links.map((link, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Название ссылки"
              value={link.title}
              onChange={(e) => updateLink(index, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="url"
              placeholder="URL (https://example.com)"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => removeLink(index)}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Удалить
          </button>
        </div>
      ))}

      {links.length === 0 && (
        <p className="text-sm text-gray-500">
          Нет ссылок. Нажмите "Добавить ссылку" чтобы добавить первую.
        </p>
      )}
    </div>
  );
};


'use client';

import { Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { SkillTag } from '../tags.service';

import {
  useCreateSkillTag,
  useDeleteSkillTag,
  useSkillTags,
  useSkillTagUsageCounts,
} from '../hooks/useSkillTags';

const CATEGORIES = [
  { label: 'Compétence', value: 'competence' },
  { label: 'Diplôme', value: 'diplome' },
  { label: 'Spécialité', value: 'specialite' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];

function getCategoryLabel(category: string | null): string {
  const found = CATEGORIES.find((c) => c.value === category);
  return found ? found.label : 'Sans catégorie';
}

function getCategoryBadgeColor(category: string | null): string {
  switch (category) {
    case 'competence':
      return 'bg-green-100 text-green-800';
    case 'diplome':
      return 'bg-blue-100 text-blue-800';
    case 'specialite':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function TagsManagementPage() {
  const { data: tags = [], isLoading } = useSkillTags();
  const { data: usageCounts = {} } = useSkillTagUsageCounts();
  const createMutation = useCreateSkillTag();
  const deleteMutation = useDeleteSkillTag();

  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryValue>('competence');

  const filteredTags = useMemo(() => {
    let result = [...tags];
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(lower));
    }
    result.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    return result;
  }, [tags, search]);

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    createMutation.mutate(
      { category: newCategory, name },
      {
        onSuccess: () => {
          setNewName('');
        },
      }
    );
  }

  function handleDelete(tag: SkillTag) {
    const confirmed = window.confirm(
      `Supprimer le tag "${tag.name}" ? Cette action est irréversible.`
    );
    if (!confirmed) return;
    deleteMutation.mutate(tag.id);
  }

  return (
    <div className='space-y-6 p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
          Gestion des Tags
        </h1>
        <p className='mt-1 text-sm text-gray-600'>
          {tags.length} tag{tags.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Add form */}
      <div className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
          <div className='flex-1'>
            <label
              className='mb-1 block text-sm font-medium text-gray-700'
              htmlFor='new-tag-name'
            >
              Nom du tag
            </label>
            <input
              className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              id='new-tag-name'
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder='Nouveau tag...'
              type='text'
              value={newName}
            />
          </div>
          <div className='sm:w-48'>
            <label
              className='mb-1 block text-sm font-medium text-gray-700'
              htmlFor='new-tag-category'
            >
              Catégorie
            </label>
            <select
              className='h-10 w-full rounded-lg border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
              id='new-tag-category'
              onChange={(e) => setNewCategory(e.target.value as CategoryValue)}
              value={newCategory}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className='inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50'
            disabled={!newName.trim() || createMutation.isPending}
            onClick={handleAdd}
          >
            <Plus className='h-4 w-4' />
            {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
        {createMutation.isError && (
          <p className='mt-2 text-sm text-red-600'>
            Erreur : {createMutation.error?.message || 'Impossible de créer le tag.'}
          </p>
        )}
      </div>

      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
        <input
          className='h-10 w-full rounded-lg border border-slate-200 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Rechercher un tag...'
          type='text'
          value={search}
        />
        {search && (
          <button
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            onClick={() => setSearch('')}
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className='flex justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
        </div>
      )}

      {/* Tags list */}
      {!isLoading && filteredTags.length === 0 && (
        <div className='rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm'>
          <p className='text-gray-500'>Aucun tag trouvé.</p>
        </div>
      )}

      {!isLoading && filteredTags.length > 0 && (
        <div className='rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-100 px-6 py-3'>
            <p className='text-sm text-gray-500'>
              {filteredTags.length} résultat{filteredTags.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ul className='divide-y divide-slate-100'>
            {filteredTags.map((tag) => {
              const count = usageCounts[tag.name] ?? 0;
              return (
                <li
                  className='flex items-center justify-between px-6 py-3'
                  key={tag.id}
                >
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium text-gray-900'>
                      {tag.name}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadgeColor(tag.category)}`}
                    >
                      {getCategoryLabel(tag.category)}
                    </span>
                    <span className='text-xs text-gray-400'>
                      {count} pro{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    className='rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600'
                    disabled={deleteMutation.isPending}
                    onClick={() => handleDelete(tag)}
                    title='Supprimer'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

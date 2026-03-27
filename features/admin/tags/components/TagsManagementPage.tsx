'use client';

import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { SkillTag } from '../tags.service';

import {
  useCreateSkillTag,
  useDeleteSkillTag,
  useSkillTags,
  useUpdateSkillTag,
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
  const createMutation = useCreateSkillTag();
  const updateMutation = useUpdateSkillTag();
  const deleteMutation = useDeleteSkillTag();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryValue | ''>('');

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryValue>('competence');

  // Edit state
  const [editingTag, setEditingTag] = useState<SkillTag | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<CategoryValue>('competence');

  // Delete confirmation
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const filteredTags = useMemo(() => {
    let result = tags;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((t) => t.name.toLowerCase().includes(lower));
    }
    if (filterCategory) {
      result = result.filter((t) => t.category === filterCategory);
    }
    return result;
  }, [tags, search, filterCategory]);

  const groupedTags = useMemo(() => {
    const groups: Record<string, SkillTag[]> = {};
    for (const tag of filteredTags) {
      const key = tag.category || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tag);
    }
    return groups;
  }, [filteredTags]);

  const categoryOrder = ['competence', 'diplome', 'specialite', 'other'];
  const sortedGroupKeys = Object.keys(groupedTags).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  function handleAdd() {
    if (!newName.trim()) return;
    createMutation.mutate(
      { category: newCategory, name: newName.trim() },
      {
        onSuccess: () => {
          setNewName('');
          setShowAddForm(false);
        },
      }
    );
  }

  function handleStartEdit(tag: SkillTag) {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditCategory((tag.category as CategoryValue) || 'competence');
  }

  function handleSaveEdit() {
    if (!editingTag || !editName.trim()) return;
    updateMutation.mutate(
      { category: editCategory, id: editingTag.id, name: editName.trim() },
      {
        onSuccess: () => {
          setEditingTag(null);
        },
      }
    );
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeletingTagId(null);
      },
    });
  }

  return (
    <div className='space-y-6 p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Gestion des Tags
          </h1>
          <p className='mt-1 text-sm text-gray-600'>
            Gérez les compétences, diplômes et spécialités disponibles pour les
            professionnels.
          </p>
        </div>
        <button
          className='inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          onClick={() => setShowAddForm(true)}
        >
          <Plus className='h-4 w-4' />
          Ajouter un tag
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-semibold text-gray-900'>
            Nouveau tag
          </h2>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
            <div className='flex-1'>
              <label
                className='mb-1 block text-sm font-medium text-gray-700'
                htmlFor='new-tag-name'
              >
                Nom
              </label>
              <input
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                id='new-tag-name'
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder='Nom du tag...'
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
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
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
            <div className='flex gap-2'>
              <button
                className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
                disabled={!newName.trim() || createMutation.isPending}
                onClick={handleAdd}
              >
                {createMutation.isPending ? 'Ajout...' : 'Ajouter'}
              </button>
              <button
                className='inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
                onClick={() => {
                  setShowAddForm(false);
                  setNewName('');
                }}
              >
                Annuler
              </button>
            </div>
          </div>
          {createMutation.isError && (
            <p className='mt-2 text-sm text-red-600'>
              Erreur : {createMutation.error?.message || 'Impossible de créer le tag.'}
            </p>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className='flex flex-col gap-3 sm:flex-row'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            className='w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
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
        <select
          className='rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-48'
          onChange={(e) => setFilterCategory(e.target.value as CategoryValue | '')}
          value={filterCategory}
        >
          <option value=''>Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className='flex justify-center py-12'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
        </div>
      )}

      {/* Tags grouped by category */}
      {!isLoading && sortedGroupKeys.length === 0 && (
        <div className='rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm'>
          <p className='text-gray-500'>Aucun tag trouvé.</p>
        </div>
      )}

      {!isLoading &&
        sortedGroupKeys.map((groupKey) => (
          <div
            className='rounded-xl border border-gray-200 bg-white shadow-sm'
            key={groupKey}
          >
            <div className='border-b border-gray-100 px-6 py-4'>
              <h2 className='text-lg font-semibold text-gray-900'>
                {getCategoryLabel(groupKey === 'other' ? null : groupKey)}
              </h2>
              <p className='text-sm text-gray-500'>
                {groupedTags[groupKey].length} tag
                {groupedTags[groupKey].length > 1 ? 's' : ''}
              </p>
            </div>
            <ul className='divide-y divide-gray-100'>
              {groupedTags[groupKey].map((tag) => (
                <li
                  className='flex items-center justify-between px-6 py-3'
                  key={tag.id}
                >
                  {editingTag?.id === tag.id ? (
                    <div className='flex flex-1 flex-col gap-2 sm:flex-row sm:items-center'>
                      <input
                        className='flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        type='text'
                        value={editName}
                      />
                      <select
                        className='rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-40'
                        onChange={(e) =>
                          setEditCategory(e.target.value as CategoryValue)
                        }
                        value={editCategory}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <div className='flex gap-2'>
                        <button
                          className='rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
                          disabled={
                            !editName.trim() || updateMutation.isPending
                          }
                          onClick={handleSaveEdit}
                        >
                          {updateMutation.isPending
                            ? 'Sauvegarde...'
                            : 'Sauvegarder'}
                        </button>
                        <button
                          className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50'
                          onClick={() => setEditingTag(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-medium text-gray-900'>
                          {tag.name}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getCategoryBadgeColor(tag.category)}`}
                        >
                          {getCategoryLabel(tag.category)}
                        </span>
                      </div>
                      <div className='flex items-center gap-1'>
                        {deletingTagId === tag.id ? (
                          <div className='flex items-center gap-2'>
                            <span className='text-sm text-red-600'>
                              Supprimer ?
                            </span>
                            <button
                              className='rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50'
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(tag.id)}
                            >
                              {deleteMutation.isPending
                                ? 'Suppression...'
                                : 'Confirmer'}
                            </button>
                            <button
                              className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50'
                              onClick={() => setDeletingTagId(null)}
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                              onClick={() => handleStartEdit(tag)}
                              title='Modifier'
                            >
                              <Pencil className='h-4 w-4' />
                            </button>
                            <button
                              className='rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600'
                              onClick={() => setDeletingTagId(tag.id)}
                              title='Supprimer'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}

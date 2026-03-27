'use client';

import { X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

import { useSkillTags } from '../hooks/useSkillTags';
import type { SkillTag } from '../tags.service';

const CATEGORY_ORDER = ['competence', 'diplome', 'specialite'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  competence: 'Compétences',
  diplome: 'Diplômes',
  specialite: 'Spécialités',
};

interface SkillTagSelectorProps {
  maxTags?: number;
  onChange: (skills: string[]) => void;
  value: string[];
}

export function SkillTagSelector({
  maxTags = 10,
  onChange,
  value,
}: SkillTagSelectorProps) {
  const { data: tags = [], isLoading } = useSkillTags();
  const [customInput, setCustomInput] = useState('');

  const isMax = value.length >= maxTags;

  const groupedTags = useMemo(() => {
    const groups: Record<string, SkillTag[]> = {};
    for (const tag of tags) {
      const key = tag.category || 'other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(tag);
    }
    // Sort each group alphabetically
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }
    return groups;
  }, [tags]);

  const tagNames = useMemo(() => new Set(tags.map((t) => t.name)), [tags]);

  // Custom skills are values that don't exist in the tags table
  const customSkills = useMemo(
    () => value.filter((s) => !tagNames.has(s)),
    [value, tagNames]
  );

  function toggleTag(name: string) {
    if (value.includes(name)) {
      onChange(value.filter((s) => s !== name));
    } else if (!isMax) {
      onChange([...value, name]);
    }
  }

  function addCustomSkill() {
    const trimmed = customInput.trim();
    if (!trimmed || value.includes(trimmed) || isMax) return;
    onChange([...value, trimmed]);
    setCustomInput('');
  }

  function removeSkill(name: string) {
    onChange(value.filter((s) => s !== name));
  }

  if (isLoading) {
    return (
      <div className='flex justify-center py-6'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      {/* Selected count */}
      <p className='text-sm text-slate-500'>
        {value.length}/{maxTags} sélectionné{value.length !== 1 ? 's' : ''}
      </p>

      {/* Tag groups */}
      {CATEGORY_ORDER.map((catKey) => {
        const group = groupedTags[catKey];
        if (!group || group.length === 0) return null;
        return (
          <div key={catKey}>
            <h3 className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400'>
              {CATEGORY_LABELS[catKey] || catKey}
            </h3>
            <div className='flex flex-wrap gap-2'>
              {group.map((tag) => {
                const selected = value.includes(tag.name);
                return (
                  <button
                    className={cn(
                      'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      isMax && !selected && 'cursor-not-allowed opacity-40'
                    )}
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    type='button'
                  >
                    {tag.name}
                    {selected && <X className='ml-1.5 h-3 w-3' />}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Custom skill input */}
      <div>
        <h3 className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400'>
          Compétence personnalisée
        </h3>
        <div className='flex gap-2'>
          <input
            className='h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={isMax}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomSkill();
              }
            }}
            placeholder='Ajouter une compétence libre...'
            type='text'
            value={customInput}
          />
          <button
            className='h-10 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
            disabled={!customInput.trim() || isMax}
            onClick={addCustomSkill}
            type='button'
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Custom skills display */}
      {customSkills.length > 0 && (
        <div>
          <h3 className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400'>
            Compétences personnalisées
          </h3>
          <div className='flex flex-wrap gap-2'>
            {customSkills.map((skill) => (
              <span
                className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600'
                key={skill}
              >
                {skill}
                <button
                  className='rounded-full p-0.5 transition-colors hover:bg-blue-100'
                  onClick={() => removeSkill(skill)}
                  type='button'
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

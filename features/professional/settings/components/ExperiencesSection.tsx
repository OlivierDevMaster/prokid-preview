'use client';

import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateExperience } from '@/features/professional/experiences/hooks/useCreateExperience';
import { useDeleteExperience } from '@/features/professional/experiences/hooks/useDeleteExperience';
import { useGetExperiences } from '@/features/professional/experiences/hooks/useGetExperiences';
import { useUpdateExperience } from '@/features/professional/experiences/hooks/useUpdateExperience';

interface ExperienceFormData {
  title: string;
  organization: string;
  start_month: string;
  start_year: string;
  end_month: string;
  end_year: string;
  is_current: boolean;
  description: string;
}

const EMPTY_FORM: ExperienceFormData = {
  title: '',
  organization: '',
  start_month: '',
  start_year: '',
  end_month: '',
  end_year: '',
  is_current: false,
  description: '',
};

const MONTHS = [
  { label: 'Janvier', value: '01' },
  { label: 'Février', value: '02' },
  { label: 'Mars', value: '03' },
  { label: 'Avril', value: '04' },
  { label: 'Mai', value: '05' },
  { label: 'Juin', value: '06' },
  { label: 'Juillet', value: '07' },
  { label: 'Août', value: '08' },
  { label: 'Septembre', value: '09' },
  { label: 'Octobre', value: '10' },
  { label: 'Novembre', value: '11' },
  { label: 'Décembre', value: '12' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 40 }, (_, i) => String(currentYear - i));

function formatMonthYear(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    const formatted = format(date, 'MMM yyyy', { locale: fr });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return dateStr;
  }
}

export default function ExperiencesSection() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';

  const { data: experiences = [] } = useGetExperiences(userId);
  const createExperience = useCreateExperience();
  const updateExperience = useUpdateExperience();
  const deleteExperience = useDeleteExperience();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExperienceFormData>(EMPTY_FORM);

  const sortedExperiences = useMemo(
    () =>
      [...experiences].sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      ),
    [experiences]
  );

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (exp: (typeof experiences)[number]) => {
      setEditingId(exp.id);
      const startParts = exp.start_date.slice(0, 7).split('-');
      const endParts = exp.end_date ? exp.end_date.slice(0, 7).split('-') : ['', ''];
      setForm({
        title: exp.title,
        organization: exp.organization,
        start_month: startParts[1] || '',
        start_year: startParts[0] || '',
        end_month: endParts[1] || '',
        end_year: endParts[0] || '',
        is_current: !exp.end_date,
        description: exp.description ?? '',
      });
      setDialogOpen(true);
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Supprimer cette expérience ?')) return;
      try {
        await deleteExperience.mutateAsync(id);
        toast.success('Expérience supprimée');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    },
    [deleteExperience]
  );

  const handleSave = useCallback(async () => {
    if (!form.title.trim() || !form.organization.trim() || !form.start_month || !form.start_year) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    if (!form.is_current && (!form.end_month || !form.end_year)) {
      toast.error('Veuillez indiquer la date de fin');
      return;
    }

    const payload = {
      title: form.title.trim(),
      organization: form.organization.trim(),
      start_date: `${form.start_year}-${form.start_month}-01`,
      end_date: form.is_current ? null : `${form.end_year}-${form.end_month}-01`,
      description: form.description.trim() || null,
      user_id: userId,
    };

    try {
      if (editingId) {
        await updateExperience.mutateAsync({
          id: editingId,
          data: payload,
        });
        toast.success('Expérience mise à jour');
      } else {
        await createExperience.mutateAsync(payload);
        toast.success('Expérience ajoutée');
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }, [form, editingId, userId, createExperience, updateExperience]);

  const isPending =
    createExperience.isPending || updateExperience.isPending;

  return (
    <section className='rounded-xl bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold'>
          <Briefcase className='size-6 text-blue-600' />
          Expériences professionnelles
        </h2>
        <Button
          className='h-10 rounded-xl bg-blue-600 hover:bg-blue-700'
          onClick={openAdd}
        >
          <Plus className='mr-1 size-4' />
          Ajouter une expérience
        </Button>
      </div>

      {sortedExperiences.length === 0 ? (
        <p className='py-8 text-center text-sm text-slate-400'>
          Aucune expérience ajoutée pour le moment.
        </p>
      ) : (
        <ul className='divide-y divide-slate-100'>
          {sortedExperiences.map(exp => (
            <li key={exp.id} className='flex items-start gap-4 py-4'>
              <div className='min-w-0 flex-1'>
                <p className='font-semibold text-slate-900'>{exp.title}</p>
                <p className='text-sm text-slate-500'>{exp.organization}</p>
                <p className='mt-0.5 text-xs text-slate-400'>
                  {formatMonthYear(exp.start_date)}
                  {' - '}
                  {exp.end_date
                    ? formatMonthYear(exp.end_date)
                    : "Aujourd'hui"}
                </p>
                {exp.description && (
                  <p className='mt-1 text-sm leading-relaxed text-slate-600'>
                    {exp.description}
                  </p>
                )}
              </div>
              <div className='flex shrink-0 gap-1'>
                <Button
                  className='text-slate-400 hover:text-blue-600'
                  onClick={() => openEdit(exp)}
                  size='icon'
                  variant='ghost'
                >
                  <Pencil className='size-4' />
                </Button>
                <Button
                  className='text-slate-400 hover:text-red-600'
                  onClick={() => handleDelete(exp.id)}
                  size='icon'
                  variant='ghost'
                >
                  <Trash2 className='size-4' />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier l\'expérience' : 'Ajouter une expérience'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifiez les informations de votre expérience professionnelle.'
                : 'Renseignez les informations de votre expérience professionnelle.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Intitulé du poste *
              </Label>
              <Input
                className='mt-1 h-10 rounded-xl border-slate-200'
                onChange={e =>
                  setForm(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Ex: Psychomotricien'
                value={form.title}
              />
            </div>

            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Organisme / Structure *
              </Label>
              <Input
                className='mt-1 h-10 rounded-xl border-slate-200'
                onChange={e =>
                  setForm(prev => ({ ...prev, organization: e.target.value }))
                }
                placeholder='Ex: Hôpital Necker'
                value={form.organization}
              />
            </div>

            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Date de début *
              </Label>
              <div className='mt-1 grid grid-cols-2 gap-2'>
                <select
                  className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm'
                  onChange={e => setForm(prev => ({ ...prev, start_month: e.target.value }))}
                  value={form.start_month}
                >
                  <option value=''>Mois</option>
                  {MONTHS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <input
                  className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm'
                  onChange={e => setForm(prev => ({ ...prev, start_year: e.target.value }))}
                  placeholder='Année'
                  type='number'
                  min={1970}
                  max={currentYear}
                  value={form.start_year}
                />
              </div>
            </div>
            {!form.is_current && (
              <div>
                <Label className='text-xs font-medium text-slate-600'>
                  Date de fin *
                </Label>
                <div className='mt-1 grid grid-cols-2 gap-2'>
                  <select
                    className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm'
                    onChange={e => setForm(prev => ({ ...prev, end_month: e.target.value }))}
                    value={form.end_month}
                  >
                    <option value=''>Mois</option>
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <input
                    className='h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm'
                    onChange={e => setForm(prev => ({ ...prev, end_year: e.target.value }))}
                    placeholder='Année'
                    type='number'
                    min={1970}
                    max={currentYear}
                    value={form.end_year}
                  />
                </div>
              </div>
            )}

            <div className='flex items-center gap-2'>
              <Checkbox
                checked={form.is_current}
                id='is-current'
                onCheckedChange={(checked: boolean) =>
                  setForm(prev => ({
                    ...prev,
                    is_current: !!checked,
                    end_month: checked ? '' : prev.end_month,
                    end_year: checked ? '' : prev.end_year,
                  }))
                }
              />
              <Label
                className='text-xs font-medium text-slate-600'
                htmlFor='is-current'
              >
                Poste actuel
              </Label>
            </div>

            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Description
              </Label>
              <Textarea
                className='mt-1 min-h-[80px] rounded-xl border-slate-200'
                onChange={e =>
                  setForm(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder='Décrivez brièvement vos missions...'
                value={form.description}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className='h-10 rounded-xl border-slate-200'
              onClick={() => setDialogOpen(false)}
              variant='outline'
            >
              Annuler
            </Button>
            <Button
              className='h-10 rounded-xl bg-blue-600 hover:bg-blue-700'
              disabled={isPending}
              onClick={handleSave}
            >
              {isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

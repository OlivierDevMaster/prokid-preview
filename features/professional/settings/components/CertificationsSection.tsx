'use client';

import { GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
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
import { useCreateCertification } from '@/features/professional/certifications/hooks/useCreateCertification';
import { useDeleteCertification } from '@/features/professional/certifications/hooks/useDeleteCertification';
import { useGetCertifications } from '@/features/professional/certifications/hooks/useGetCertifications';
import { useUpdateCertification } from '@/features/professional/certifications/hooks/useUpdateCertification';

interface CertificationFormData {
  name: string;
  institution: string;
  year_obtained: string;
}

const EMPTY_FORM: CertificationFormData = {
  name: '',
  institution: '',
  year_obtained: '',
};

export default function CertificationsSection() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? '';

  const { data: certifications = [] } = useGetCertifications(userId);
  const createCertification = useCreateCertification();
  const updateCertification = useUpdateCertification();
  const deleteCertification = useDeleteCertification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CertificationFormData>(EMPTY_FORM);

  const sortedCertifications = useMemo(
    () =>
      [...certifications].sort(
        (a, b) => b.year_obtained - a.year_obtained
      ),
    [certifications]
  );

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (cert: (typeof certifications)[number]) => {
      setEditingId(cert.id);
      setForm({
        name: cert.name,
        institution: cert.institution ?? '',
        year_obtained: String(cert.year_obtained),
      });
      setDialogOpen(true);
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm('Supprimer ce diplôme ?')) return;
      try {
        await deleteCertification.mutateAsync(id);
        toast.success('Diplôme supprimé');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    },
    [deleteCertification]
  );

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error('Veuillez indiquer le nom du diplôme');
      return;
    }
    const year = Number.parseInt(form.year_obtained, 10);
    if (Number.isNaN(year) || year < 1950 || year > 2026) {
      toast.error("Veuillez indiquer une année valide (1950 - 2026)");
      return;
    }

    const payload = {
      name: form.name.trim(),
      institution: form.institution.trim() || null,
      year_obtained: year,
      user_id: userId,
    };

    try {
      if (editingId) {
        await updateCertification.mutateAsync({
          id: editingId,
          data: payload,
        });
        toast.success('Diplôme mis à jour');
      } else {
        await createCertification.mutateAsync(payload);
        toast.success('Diplôme ajouté');
      }
      setDialogOpen(false);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }, [form, editingId, userId, createCertification, updateCertification]);

  const isPending =
    createCertification.isPending || updateCertification.isPending;

  return (
    <section className='rounded-xl bg-white p-6 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='flex items-center gap-2 text-xl font-bold'>
          <GraduationCap className='size-6 text-blue-600' />
          Diplômes et certifications
        </h2>
        <Button
          className='h-10 rounded-xl bg-blue-600 hover:bg-blue-700'
          onClick={openAdd}
        >
          <Plus className='mr-1 size-4' />
          Ajouter un diplôme
        </Button>
      </div>

      {sortedCertifications.length === 0 ? (
        <p className='py-8 text-center text-sm text-slate-400'>
          Aucun diplôme ajouté pour le moment.
        </p>
      ) : (
        <ul className='divide-y divide-slate-100'>
          {sortedCertifications.map(cert => (
            <li key={cert.id} className='flex items-center gap-4 py-4'>
              <div className='min-w-0 flex-1'>
                <p className='font-semibold text-slate-900'>{cert.name}</p>
                {cert.institution && (
                  <p className='text-sm text-slate-500'>{cert.institution}</p>
                )}
              </div>
              <span className='shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700'>
                {cert.year_obtained}
              </span>
              <div className='flex shrink-0 gap-1'>
                <Button
                  className='text-slate-400 hover:text-blue-600'
                  onClick={() => openEdit(cert)}
                  size='icon'
                  variant='ghost'
                >
                  <Pencil className='size-4' />
                </Button>
                <Button
                  className='text-slate-400 hover:text-red-600'
                  onClick={() => handleDelete(cert.id)}
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
              {editingId ? 'Modifier le diplôme' : 'Ajouter un diplôme'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifiez les informations de votre diplôme ou certification.'
                : 'Renseignez les informations de votre diplôme ou certification.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Nom du diplôme *
              </Label>
              <Input
                className='mt-1 h-10 rounded-xl border-slate-200'
                onChange={e =>
                  setForm(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='Ex: Diplôme d&#39;État de Psychomotricien'
                value={form.name}
              />
            </div>

            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Établissement
              </Label>
              <Input
                className='mt-1 h-10 rounded-xl border-slate-200'
                onChange={e =>
                  setForm(prev => ({ ...prev, institution: e.target.value }))
                }
                placeholder='Ex: Université Paris Descartes'
                value={form.institution}
              />
            </div>

            <div>
              <Label className='text-xs font-medium text-slate-600'>
                Année d&#39;obtention *
              </Label>
              <Input
                className='mt-1 h-10 rounded-xl border-slate-200'
                max={2026}
                min={1950}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    year_obtained: e.target.value,
                  }))
                }
                placeholder='2020'
                type='number'
                value={form.year_obtained}
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

import { createClient } from '@/lib/supabase/client';

export type SkillTag = {
  category: string | null;
  created_at: string;
  id: string;
  name: string;
  updated_at: string;
};

export async function getSkillTags(): Promise<SkillTag[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('skill_tags')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;

  return data as SkillTag[];
}

export async function createSkillTag(
  name: string,
  category: string | null
): Promise<SkillTag> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('skill_tags')
    .insert({ category, name })
    .select()
    .single();

  if (error) throw error;

  return data as SkillTag;
}

export async function updateSkillTag(
  id: string,
  name: string,
  category: string | null
): Promise<SkillTag> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('skill_tags')
    .update({ category, name, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as SkillTag;
}

export async function deleteSkillTag(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from('skill_tags').delete().eq('id', id);

  if (error) throw error;
}

export async function getSkillTagUsageCounts(): Promise<Record<string, number>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('professionals')
    .select('skills');

  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const skills = row.skills as string[] | null;
    if (!skills) continue;
    for (const skill of skills) {
      counts[skill] = (counts[skill] ?? 0) + 1;
    }
  }
  return counts;
}

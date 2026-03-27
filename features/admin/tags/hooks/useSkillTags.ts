import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSkillTag,
  deleteSkillTag,
  getSkillTagUsageCounts,
  getSkillTags,
  updateSkillTag,
} from '../tags.service';

const SKILL_TAGS_QUERY_KEY = ['admin', 'skill-tags'];

export function useSkillTags() {
  return useQuery({
    queryFn: getSkillTags,
    queryKey: SKILL_TAGS_QUERY_KEY,
  });
}

export function useCreateSkillTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ category, name }: { category: string | null; name: string }) =>
      createSkillTag(name, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_TAGS_QUERY_KEY });
    },
  });
}

export function useUpdateSkillTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      category,
      id,
      name,
    }: {
      category: string | null;
      id: string;
      name: string;
    }) => updateSkillTag(id, name, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_TAGS_QUERY_KEY });
    },
  });
}

export function useSkillTagUsageCounts() {
  return useQuery({
    queryFn: getSkillTagUsageCounts,
    queryKey: ['admin', 'skill-tag-usage-counts'],
  });
}

export function useDeleteSkillTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSkillTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SKILL_TAGS_QUERY_KEY });
    },
  });
}

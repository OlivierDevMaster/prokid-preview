import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalExperienceUpdate } from '../experience.model';

import { updateExperience } from '../experience.service';

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      data,
      id,
    }: {
      data: ProfessionalExperienceUpdate;
      id: string;
    }) => {
      return updateExperience(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-experiences'] });
    },
  });
};

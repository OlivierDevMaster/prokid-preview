import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfessionalExperienceInsert } from '../experience.model';

import { createExperience } from '../experience.service';

export const useCreateExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (experience: ProfessionalExperienceInsert) => {
      return createExperience(experience);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-experiences'] });
    },
  });
};

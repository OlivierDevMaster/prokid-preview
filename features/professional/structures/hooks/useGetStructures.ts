import { useQuery } from '@tanstack/react-query';

import { getStructures } from '../services/structure.service';

export default function useGetStructures() {
  return useQuery({
    queryFn: async () => getStructures(),
    queryKey: ['professional-structures'],
  });
}

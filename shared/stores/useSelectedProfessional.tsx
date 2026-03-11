import { create } from 'zustand';

type professionalActions = {
  handleClearSelection: () => void;
  handleToggleProfessional: (professionalId: string) => void;
  setSelectedProfessionalIds: (professionalIds: Set<string>) => void;
};

type professionalState = {
  selectedProfessionalIds: Set<string>;
};

type professionalStore = professionalActions & professionalState;

export const useSelectedProfessional = create<professionalStore>(set => ({
  handleClearSelection: () => set({ selectedProfessionalIds: new Set() }),
  handleToggleProfessional: professionalId =>
    set(state => {
      const next = new Set(state.selectedProfessionalIds);
      if (next.has(professionalId)) next.delete(professionalId);
      else next.add(professionalId);
      return { selectedProfessionalIds: next };
    }),
  selectedProfessionalIds: new Set(),
  setSelectedProfessionalIds: professionalIds =>
    set({ selectedProfessionalIds: professionalIds }),
}));

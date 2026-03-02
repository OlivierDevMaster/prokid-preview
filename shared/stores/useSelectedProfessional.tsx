import { create } from 'zustand'

type professionalState = {
    selectedProfessionalIds: Set<string>
}

type professionalActions={
    setSelectedProfessionalIds: (professionalIds: Set<string>) => void
    handleToggleProfessional: (professionalId: string) => void
    handleClearSelection: () => void

}

type professionalStore = professionalState & professionalActions

export const useSelectedProfessional = create<professionalStore>((set) => ({
    selectedProfessionalIds: new Set(),
    setSelectedProfessionalIds: (professionalIds) => set({ selectedProfessionalIds: professionalIds }),
    handleToggleProfessional: (professionalId) => set((state) => ({ selectedProfessionalIds: state.selectedProfessionalIds.add(professionalId) })),
    handleClearSelection: () => set({ selectedProfessionalIds: new Set() }),
}))


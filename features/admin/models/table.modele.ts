export type TableActionType = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

export type TableHeaderActionType = {
  actions: TableActionType[];
};

export type TableActionType = {
  className?: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

export type TableHeaderActionType = {
  actions: TableActionType[];
};

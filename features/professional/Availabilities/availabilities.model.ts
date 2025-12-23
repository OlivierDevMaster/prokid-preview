export interface DaySchedule {
  enabled: boolean;
  recurring: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  end: string;
  isDeleted?: boolean;
  recurring?: boolean;
  start: string;
}

export interface Structure {
  email: string;
  hoursCompleted: number;
  hoursTotal: number;
  id: string;
  lastReportDate: string;
  location: string;
  name: string;
  status: 'on_time' | 'to_monitor';
}

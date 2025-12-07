import { Structure } from '../modeles/Structure';

export const MOCK_STRUCTURES: Structure[] = [
  {
    email: 'contact@petitsloups.fr',
    hoursCompleted: 32,
    hoursTotal: 80,
    id: '1',
    lastReportDate: '15/12/2024',
    location: 'Paris 15ème',
    name: 'Micro-crèche Les Petits Loups',
    status: 'on_time',
  },
  {
    email: 'direction@arcenciel.fr',
    hoursCompleted: 18,
    hoursTotal: 50,
    id: '2',
    lastReportDate: '10/12/2024',
    location: 'Lyon 6ème',
    name: 'Crèche Familiale Arc-en-Ciel',
    status: 'to_monitor',
  },
];

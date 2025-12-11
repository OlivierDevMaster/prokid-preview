export const MissionTestData = {
  invalidMissionRequestEmptySchedules: {
    description: 'Test mission',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission',
  },

  invalidMissionRequestInvalidDates: {
    description: 'Test mission',
    mission_dtstart: '2025-12-31T18:00:00Z',
    mission_until: '2025-06-01T09:00:00Z', // End before start
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: 120,
        rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission',
  },

  invalidMissionRequestInvalidDuration: {
    description: 'Test mission',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: -10,
        rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission',
  },

  invalidMissionRequestInvalidRRULE: {
    description: 'Test mission',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: 120,
        rrule: 'INVALID_RRULE',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission',
  },

  // Invalid request bodies
  invalidMissionRequestMissingSchedules: {
    description: 'Test mission',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission',
  },

  invalidMissionRequestMissingTitle: {
    description: 'Test mission',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: 120,
        rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
  },

  // Test UUIDs
  testUuids: {
    empty: '',
    invalid: 'invalid-uuid-format',
    nonExistent: '550e8400-e29b-41d4-a716-446655440999',
    valid: '550e8400-e29b-41d4-a716-446655440000',
    valid2: '550e8400-e29b-41d4-a716-446655440001',
    valid3: '550e8400-e29b-41d4-a716-446655440002',
  },

  // Valid mission request bodies
  validMissionRequest: {
    description: 'Test mission description',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: 120,
        rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission',
  },

  validMissionRequestMultipleSchedules: {
    description: 'Test mission with multiple schedules',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-12-31T18:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: 120,
        rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
      },
      {
        duration_mn: 180,
        rrule: 'DTSTART:20250601T140000Z\nRRULE:FREQ=WEEKLY;BYDAY=WE',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Test Mission Multiple Schedules',
  },

  validMissionRequestOneTime: {
    description: 'One-time mission',
    mission_dtstart: '2025-06-01T09:00:00Z',
    mission_until: '2025-06-01T11:00:00Z',
    professional_id: '550e8400-e29b-41d4-a716-446655440000',
    schedules: [
      {
        duration_mn: 120,
        rrule: 'DTSTART:20250601T090000Z\nRRULE:FREQ=DAILY;COUNT=1',
      },
    ],
    structure_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'One-Time Mission',
  },
};

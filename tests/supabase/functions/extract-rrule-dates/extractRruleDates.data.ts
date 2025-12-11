export const ExtractRruleDatesTestData = {
  invalidBodyInvalidRecordId: {
    record_id: 'invalid-uuid',
    table_name: 'mission_schedules',
  },

  invalidBodyInvalidTableName: {
    record_id: '550e8400-e29b-41d4-a716-446655440000',
    table_name: 'invalid_table',
  },

  // Invalid request bodies
  invalidBodyMissingRecordId: {
    table_name: 'mission_schedules',
  },

  invalidBodyMissingTableName: {
    record_id: '550e8400-e29b-41d4-a716-446655440000',
  },

  // Invalid RRULE examples
  invalidRruleEmpty: '',

  invalidRruleInvalidDate: 'DTSTART:INVALID\nRRULE:FREQ=WEEKLY;BYDAY=MO',
  invalidRruleMalformed: 'INVALID_RRULE_FORMAT',
  invalidRruleMissingDtstart: 'RRULE:FREQ=WEEKLY;BYDAY=MO',
  // Test UUIDs
  testUuids: {
    nonExistent: '550e8400-e29b-41d4-a716-446655440999',
    valid: '550e8400-e29b-41d4-a716-446655440000',
  },

  validBodyAvailabilities: {
    record_id: '550e8400-e29b-41d4-a716-446655440000',
    table_name: 'availabilities' as const,
  },

  // Valid request bodies
  validBodyMissionSchedules: {
    record_id: '550e8400-e29b-41d4-a716-446655440000',
    table_name: 'mission_schedules' as const,
  },

  validRruleDaily: {
    expectedDtstart: '2025-01-01T08:00:00.000Z',
    expectedUntil: null,
    rrule: 'DTSTART:20250101T080000Z\nRRULE:FREQ=DAILY;INTERVAL=2',
  },

  validRruleMonthly: {
    expectedDtstart: '2025-01-01T10:00:00.000Z',
    expectedUntil: null,
    rrule: 'DTSTART:20250101T100000Z\nRRULE:FREQ=MONTHLY;BYMONTHDAY=1',
  },

  // Valid RRULE examples
  validRruleSimple: {
    expectedDtstart: '2025-01-01T09:00:00.000Z',
    expectedUntil: null,
    rrule: 'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO',
  },

  validRruleWithExdate: {
    expectedDtstart: '2025-01-01T09:00:00.000Z',
    expectedUntil: null,
    rrule:
      'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nEXDATE:20250115T090000Z',
  },

  validRruleWithUntil: {
    expectedDtstart: '2025-01-01T09:00:00.000Z',
    expectedUntil: '2025-12-31T09:00:00.000Z',
    rrule:
      'DTSTART:20250101T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20251231T090000Z',
  },
};

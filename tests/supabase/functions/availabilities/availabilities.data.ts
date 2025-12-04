export const AvailabilityTestData = {
  // Valid query parameters
  validQueryParams: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-01-31T23:59:59Z',
  },

  // Edge cases
  edgeCaseLargeDateRange: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-12-31T23:59:59Z', // Full year
  },

  edgeCaseSmallDateRange: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-01-01T23:59:59Z', // Single day
  },

  edgeCaseSameDay: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-01-01T23:59:59Z',
  },

  // Invalid query parameters
  invalidQueryParamsMissingProfessionalId: {
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-01-31T23:59:59Z',
  },

  invalidQueryParamsMissingStartAt: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    endAt: '2025-01-31T23:59:59Z',
  },

  invalidQueryParamsMissingEndAt: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },

  invalidQueryParamsInvalidProfessionalId: {
    professionalId: 'invalid-uuid',
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-01-31T23:59:59Z',
  },

  invalidQueryParamsInvalidStartAt: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: 'invalid-date',
    endAt: '2025-01-31T23:59:59Z',
  },

  invalidQueryParamsInvalidEndAt: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
    endAt: 'invalid-date',
  },

  invalidQueryParamsStartAfterEnd: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-31T23:59:59Z',
    endAt: '2025-01-01T00:00:00Z', // Start after end
  },

  invalidQueryParamsStartEqualsEnd: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
    endAt: '2025-01-01T00:00:00Z', // Start equals end
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

  // Expected response structures
  expectedSlotStructure: {
    startAt: 'string',
    endAt: 'string',
  },
};


export const AvailabilityTestData = {
  // Edge cases
  edgeCaseLargeDateRange: {
    endAt: '2025-12-31T23:59:59Z', // Full year
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },

  edgeCaseSameDay: {
    endAt: '2025-01-01T23:59:59Z',
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },

  edgeCaseSmallDateRange: {
    endAt: '2025-01-01T23:59:59Z', // Single day
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },

  // Expected response structures
  expectedSlotStructure: {
    endAt: 'string',
    startAt: 'string',
  },

  invalidQueryParamsInvalidEndAt: {
    endAt: 'invalid-date',
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },

  invalidQueryParamsInvalidProfessionalId: {
    endAt: '2025-01-31T23:59:59Z',
    professionalId: 'invalid-uuid',
    startAt: '2025-01-01T00:00:00Z',
  },

  invalidQueryParamsInvalidStartAt: {
    endAt: '2025-01-31T23:59:59Z',
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: 'invalid-date',
  },

  invalidQueryParamsMissingEndAt: {
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },

  // Invalid query parameters
  invalidQueryParamsMissingProfessionalId: {
    endAt: '2025-01-31T23:59:59Z',
    startAt: '2025-01-01T00:00:00Z',
  },

  invalidQueryParamsMissingStartAt: {
    endAt: '2025-01-31T23:59:59Z',
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
  },

  invalidQueryParamsStartAfterEnd: {
    endAt: '2025-01-01T00:00:00Z', // Start after end
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-31T23:59:59Z',
  },

  invalidQueryParamsStartEqualsEnd: {
    endAt: '2025-01-01T00:00:00Z', // Start equals end
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
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

  // Valid query parameters
  validQueryParams: {
    endAt: '2025-01-31T23:59:59Z',
    professionalId: '550e8400-e29b-41d4-a716-446655440000',
    startAt: '2025-01-01T00:00:00Z',
  },
};

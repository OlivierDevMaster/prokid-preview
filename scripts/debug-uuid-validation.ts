import { z } from 'zod';

const GetAvailabilitySlotsQuerySchema = z.object({
  endAt: z.iso.datetime(),
  professionalId: z.uuid(),
  startAt: z.iso.datetime(),
});

const testUuid = '00000000-0000-0000-0000-000000000010';

console.log('Testing UUID validation...\n');
console.log('Test UUID:', testUuid);
console.log('UUID length:', testUuid.length);
console.log(
  'UUID matches pattern:',
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    testUuid
  )
);
console.log('\n');

const testCases = [
  {
    data: {
      endAt: '2025-12-20T00:00:00Z',
      professionalId: testUuid,
      startAt: '2025-12-12T00:00:00Z',
    },
    name: 'Full query params with test UUID',
  },
  {
    data: {
      endAt: '2025-12-20T00:00:00Z',
      professionalId: String(testUuid),
      startAt: '2025-12-12T00:00:00Z',
    },
    name: 'Query params as strings (simulating URL query)',
  },
  {
    data: {
      endAt: '2025-12-20T00:00:00Z',
      professionalId: '550e8400-e29b-41d4-a716-446655440000',
      startAt: '2025-12-12T00:00:00Z',
    },
    name: 'Valid UUID format',
  },
  {
    data: {
      endAt: '2025-12-20T00:00:00Z',
      professionalId: testUuid,
      startAt: '2025-12-12T00:00:00Z',
    },
    name: 'Test UUID with z.string().uuid()',
    schema: z.object({
      endAt: z.iso.datetime(),
      professionalId: z.string().uuid(),
      startAt: z.iso.datetime(),
    }),
  },
];

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(60));

  const schema = testCase.schema || GetAvailabilitySlotsQuerySchema;
  const result = schema.safeParse(testCase.data);

  if (result.success) {
    console.log('✅ Validation PASSED');
    console.log('Parsed data:', JSON.stringify(result.data, null, 2));
  } else {
    console.log('❌ Validation FAILED');
    console.log('Errors:');
    result.error.issues.forEach(issue => {
      console.log(`  - ${issue.path.join('.')}: ${issue.message}`);
      if (issue.code === 'invalid_type' && issue.expected) {
        console.log(`    Validation: ${issue.expected}`);
      }
    });
    console.log('\nFull error object:');
    console.log(JSON.stringify(result.error, null, 2));
  }
});

console.log('\n\n' + '='.repeat(60));
console.log('Additional UUID format tests');
console.log('='.repeat(60));

const uuidVariations = [
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010 ',
  ' 00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000010\n',
  '00000000-0000-0000-0000-000000000010\r',
];

uuidVariations.forEach(uuid => {
  const result = z.uuid().safeParse(uuid);
  console.log(`\nUUID: "${uuid}" (length: ${uuid.length})`);
  console.log(`  Valid: ${result.success ? '✅' : '❌'}`);
  if (!result.success) {
    console.log(`  Error: ${result.error.issues[0]?.message}`);
  }
});

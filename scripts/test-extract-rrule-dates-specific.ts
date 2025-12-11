import { appendFileSync } from 'fs';
import { rrulestr } from 'rrule';

// Debug logging helper
const logPath = '.cursor/debug.log';
function log(
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string,
  location: string
) {
  const logEntry = {
    data,
    hypothesisId,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    location,
    message,
    runId: 'run1',
    sessionId: 'debug-session',
    timestamp: Date.now(),
  };
  appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
}

console.log('=== Testing Edge Function Logic: extract-rrule-dates ===\n');

// Input RRULE (the one that's failing)
const testRRULE = `DTSTART:20251220T100000Z
RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=20251218T100000Z
EXDATE:20251225T080000Z,20260101T080000Z`;

console.log('Input RRULE:');
console.log(testRRULE);
console.log('\n');

// #region agent log
log(
  'Script started',
  { rrule: testRRULE },
  'A',
  'test-extract-rrule-dates-specific.ts:1'
);
// #endregion

// Test different parsing approaches
console.log('=== Test 1: Parse full RRULE (what handler does) ===\n');

try {
  // #region agent log
  log(
    'Before parsing full RRULE',
    { rruleString: testRRULE },
    'A',
    'test-extract-rrule-dates-specific.ts:48'
  );
  // #endregion

  // This is what the handler does: rrulestr(record.rrule)
  const rule = rrulestr(testRRULE);

  // #region agent log
  log(
    'After parsing full RRULE',
    {
      dtstart: rule.options.dtstart?.toISOString(),
      hasDtstart: !!rule.options.dtstart,
      hasUntil: !!rule.options.until,
      options: rule.options,
      until: rule.options.until?.toISOString(),
    },
    'A',
    'test-extract-rrule-dates-specific.ts:62'
  );
  // #endregion

  console.log('❌ WRONG RESULT:');
  console.log('  dtstart:', rule.options.dtstart?.toISOString() || 'null');
  console.log('  until:', rule.options.until?.toISOString() || 'null');
  console.log('  Expected dtstart: 2025-12-20T10:00:00.000Z');
  console.log('  Expected until: 2025-12-18T10:00:00.000Z');
  console.log('\n');
} catch (error) {
  console.log('❌ FAILED:', error);
  console.log('\n');
}

// Test 2: Parse without EXDATE
console.log('=== Test 2: Parse without EXDATE ===\n');
const rruleWithoutExdate = `DTSTART:20251220T100000Z
RRULE:BYDAY=TH;FREQ=WEEKLY;UNTIL=20251218T100000Z`;

try {
  // #region agent log
  log(
    'Before parsing without EXDATE',
    { rruleString: rruleWithoutExdate },
    'B',
    'test-extract-rrule-dates-specific.ts:85'
  );
  // #endregion

  const rule2 = rrulestr(rruleWithoutExdate);

  // #region agent log
  log(
    'After parsing without EXDATE',
    {
      dtstart: rule2.options.dtstart?.toISOString(),
      hasUntil: !!rule2.options.until,
      until: rule2.options.until?.toISOString(),
    },
    'B',
    'test-extract-rrule-dates-specific.ts:99'
  );
  // #endregion

  console.log('Result:');
  console.log('  dtstart:', rule2.options.dtstart?.toISOString() || 'null');
  console.log('  until:', rule2.options.until?.toISOString() || 'null');
  console.log('\n');
} catch (error) {
  console.log('❌ FAILED:', error);
  console.log('\n');
}

// Test 3: Extract only parseable parts (DTSTART + RRULE)
console.log('=== Test 3: Extract only DTSTART + RRULE lines ===\n');
function extractParseableRRULE(rruleString: string): string {
  const lines = rruleString.split('\n');
  const parseableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DTSTART:') || trimmed.startsWith('RRULE:')) {
      parseableLines.push(trimmed);
    }
  }

  return parseableLines.join('\n');
}

const parseableRRULE = extractParseableRRULE(testRRULE);
console.log('Parseable RRULE:', parseableRRULE);
console.log('\n');

try {
  // #region agent log
  log(
    'Before parsing parseable RRULE',
    { parseableRRULE },
    'C',
    'test-extract-rrule-dates-specific.ts:133'
  );
  // #endregion

  const rule3 = rrulestr(parseableRRULE);

  // #region agent log
  log(
    'After parsing parseable RRULE',
    {
      dtstart: rule3.options.dtstart?.toISOString(),
      hasUntil: !!rule3.options.until,
      until: rule3.options.until?.toISOString(),
    },
    'C',
    'test-extract-rrule-dates-specific.ts:147'
  );
  // #endregion

  console.log('✅ CORRECT RESULT:');
  console.log('  dtstart:', rule3.options.dtstart?.toISOString() || 'null');
  console.log('  until:', rule3.options.until?.toISOString() || 'null');
  console.log('\n');
} catch (error) {
  console.log('❌ FAILED:', error);
  console.log('\n');
}

// Simulate the exact logic from extractRruleDatesHandler
console.log('=== Simulating Handler Logic (with fix) ===\n');

try {
  // #region agent log
  log(
    'Before parsing RRULE (handler simulation)',
    { rruleString: testRRULE },
    'D',
    'test-extract-rrule-dates-specific.ts:165'
  );
  // #endregion

  // FIX: Extract only parseable parts before parsing
  const parseable = extractParseableRRULE(testRRULE);
  const rule = rrulestr(parseable);

  // Extract dtstart and until (handler logic)
  let dtstart: Date | null = null;
  let until: Date | null = null;

  dtstart = rule.options.dtstart || null;
  until = rule.options.until || null;

  // #region agent log
  log(
    'Extracted dates',
    {
      dtstart: dtstart?.toISOString(),
      dtstartRaw: dtstart,
      until: until?.toISOString(),
      untilRaw: until,
    },
    'D',
    'test-extract-rrule-dates-specific.ts:179'
  );
  // #endregion

  // Build updateData (handler logic)
  const updateData: {
    dtstart?: null | string;
    until?: null | string;
  } = {};

  if (dtstart) {
    updateData.dtstart = dtstart.toISOString();
  } else {
    updateData.dtstart = null;
  }

  if (until) {
    updateData.until = until.toISOString();
  } else {
    updateData.until = null;
  }

  // #region agent log
  log(
    'Final updateData',
    { updateData },
    'D',
    'test-extract-rrule-dates-specific.ts:198'
  );
  // #endregion

  // Display results
  console.log('✅ Parsing successful!\n');
  console.log('Extracted values:');
  console.log('  dtstart:', updateData.dtstart);
  console.log('  until:', updateData.until);
  console.log('\n');

  // Additional analysis
  console.log('=== Analysis ===\n');

  if (dtstart && until) {
    const untilBeforeDtstart = until.getTime() < dtstart.getTime();
    const diffDays = (until.getTime() - dtstart.getTime()) / 86400000;

    // #region agent log
    log(
      'Date comparison',
      {
        diffDays,
        dtstartISO: dtstart.toISOString(),
        dtstartTime: dtstart.getTime(),
        untilBeforeDtstart,
        untilISO: until.toISOString(),
        untilTime: until.getTime(),
      },
      'D',
      'test-extract-rrule-dates-specific.ts:221'
    );
    // #endregion

    console.log('DTSTART:', dtstart.toISOString());
    console.log('UNTIL:', until.toISOString());
    console.log('UNTIL is before DTSTART:', untilBeforeDtstart);
    console.log('Difference (days):', diffDays.toFixed(2));
    console.log('\n');

    if (untilBeforeDtstart) {
      console.log('⚠️  WARNING: UNTIL is before DTSTART!');
      console.log('   This means no occurrences will be generated.');
      console.log('   The RRULE is invalid or has incorrect dates.\n');
    }
  }

  // Test occurrence generation
  console.log('=== Occurrence Generation Test ===\n');
  const occurrences = rule.all();

  // #region agent log
  log(
    'Generated occurrences',
    {
      count: occurrences.length,
      firstFew: occurrences.slice(0, 10).map(d => d.toISOString()),
    },
    'D',
    'test-extract-rrule-dates-specific.ts:243'
  );
  // #endregion

  console.log('Generated occurrences:', occurrences.length);
  if (occurrences.length > 0) {
    console.log('First 10 occurrences:');
    occurrences.slice(0, 10).forEach((date, idx) => {
      console.log(`  ${idx + 1}. ${date.toISOString()}`);
    });
  } else {
    console.log('⚠️  No occurrences generated!');
  }
  console.log('\n');

  // Show what the handler would return
  console.log('=== Handler Response (what would be returned) ===\n');
  const handlerResponse = {
    dtstart: dtstart?.toISOString() || null,
    until: until?.toISOString() || null,
  };
  console.log(JSON.stringify(handlerResponse, null, 2));
  console.log('\n');
} catch (rruleError) {
  // #region agent log
  log(
    'Parsing error',
    {
      error: String(rruleError),
      errorMessage: (rruleError as Error).message,
      stack: (rruleError as Error).stack,
    },
    'E',
    'test-extract-rrule-dates-specific.ts:271'
  );
  // #endregion

  console.log('❌ FAILED to parse RRULE');
  console.log('Error:', rruleError);
  console.log('Error message:', (rruleError as Error).message);
  console.log('\n');
}

// #region agent log
log('Script completed', {}, 'A', 'test-extract-rrule-dates-specific.ts:148');
// #endregion

console.log('=== Summary ===');
console.log('Input RRULE:');
console.log('  DTSTART: 2025-12-20 10:00:00 UTC (Saturday)');
console.log('  RRULE: BYDAY=TH;FREQ=WEEKLY;UNTIL=20251218T100000Z');
console.log(
  '  UNTIL: 2025-12-18 10:00:00 UTC (Thursday, 2 days BEFORE DTSTART)'
);
console.log('  EXDATE: 2025-12-25, 2026-01-01');
console.log('\n');
console.log('Expected behavior:');
console.log(
  '  - Handler should extract dtstart and until from the parsed RRULE'
);
console.log(
  '  - Since UNTIL is before DTSTART, no occurrences should be generated'
);
console.log("  - The extracted dates should match what's in the RRULE");

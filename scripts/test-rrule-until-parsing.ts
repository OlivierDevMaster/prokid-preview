import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

console.log('Testing rrulestr() parsing with UNTIL...\n');

// Test 1: RRULE with UNTIL in the RRULE line itself (traditional format)
console.log('Test 1: RRULE with UNTIL in RRULE line (traditional format)');
const rruleWithUntilInLine =
  'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20251231T090000Z';
console.log('Input:', rruleWithUntilInLine);
try {
  const rule1 = rrulestr(rruleWithUntilInLine);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Options:', JSON.stringify(rule1.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

// Test 2: RRULE with UNTIL as separate line (RFC 5545 format - what we use)
console.log(
  'Test 2: RRULE with UNTIL as separate line (RFC 5545 format - what we use)'
);
const rruleWithUntilSeparate =
  'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nUNTIL:20251231T090000Z';
console.log('Input:', rruleWithUntilSeparate);
try {
  const rule2 = rrulestr(rruleWithUntilSeparate);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Options:', JSON.stringify(rule2.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
  console.log('Error message:', (error as Error).message);
}
console.log('');

// Test 3: RRULE without UNTIL (should work)
console.log('Test 3: RRULE without UNTIL (should work)');
const rruleWithoutUntil =
  'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO';
console.log('Input:', rruleWithoutUntil);
try {
  const rule3 = rrulestr(rruleWithoutUntil);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Options:', JSON.stringify(rule3.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

// Test 4: RRULE with EXDATE as separate line (should work)
console.log('Test 4: RRULE with EXDATE as separate line (should work)');
const rruleWithExdate =
  'DTSTART:20250601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO\nEXDATE:20250608T090000Z';
console.log('Input:', rruleWithExdate);
try {
  const rule4 = rrulestr(rruleWithExdate);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Options:', JSON.stringify(rule4.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

// Test 5: Our actual format (DTSTART, RRULE, UNTIL, EXDATE)
console.log('Test 5: Our actual format (DTSTART, RRULE, UNTIL, EXDATE)');
const ourFormat =
  'DTSTART:20250601T090000Z\nRRULE:BYDAY=MO;FREQ=WEEKLY;INTERVAL=1;WKST=MO\nUNTIL:20251231T090000Z\nEXDATE:20250608T090000Z';
console.log('Input:', ourFormat);
try {
  const rule5 = rrulestr(ourFormat);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Options:', JSON.stringify(rule5.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
  console.log('Error message:', (error as Error).message);
}
console.log('');

// Test 6: Only DTSTART and RRULE lines (what extractParseableRRULE returns)
console.log(
  'Test 6: Only DTSTART and RRULE lines (what extractParseableRRULE returns)'
);
const parseableOnly =
  'DTSTART:20250601T090000Z\nRRULE:BYDAY=MO;FREQ=WEEKLY;INTERVAL=1;WKST=MO';
console.log('Input:', parseableOnly);
try {
  const rule6 = rrulestr(parseableOnly);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Options:', JSON.stringify(rule6.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

console.log('Summary:');
console.log(
  "- rrulestr() CAN parse UNTIL when it's in the RRULE line (UNTIL=...)"
);
console.log(
  "- rrulestr() CANNOT parse UNTIL when it's a separate line (UNTIL:...)"
);
console.log(
  '- This is why we need extractParseableRRULE() to remove UNTIL line before parsing'
);

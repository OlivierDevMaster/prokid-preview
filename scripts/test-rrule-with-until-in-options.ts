import RRulePkg from 'rrule';
const { RRule, rrulestr } = RRulePkg;

console.log('Testing RRule with UNTIL in options...\n');

// Test: Create RRule with UNTIL in options
console.log('Test: Create RRule with UNTIL in options');
const rule = new RRule({
  byweekday: RRule.MO,
  dtstart: new Date('2025-06-01T09:00:00Z'),
  freq: RRule.WEEKLY,
  until: new Date('2025-12-31T09:00:00Z'),
});

console.log('Rule options:', JSON.stringify(rule.options, null, 2));
console.log('rule.toString():', rule.toString());

// Test: Can we parse it back?
console.log('\nTest: Can we parse it back?');
const rruleString = `DTSTART:20250601T090000Z\n${rule.toString()}`;
console.log('Full string:', rruleString);
try {
  const parsed = rrulestr(rruleString);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Parsed options:', JSON.stringify(parsed.options, null, 2));
  console.log('Parsed until:', parsed.options.until);
} catch (error) {
  console.log('❌ FAILED:', error);
}

// Test: What if we format it with DTSTART and the RRULE line?
console.log(
  '\nTest: Format with DTSTART and RRULE line (what we should store)'
);
const formatted = `DTSTART:20250601T090000Z\n${rule.toString()}`;
console.log('Formatted:', formatted);
try {
  const parsed2 = rrulestr(formatted);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('Parsed until:', parsed2.options.until);
} catch (error) {
  console.log('❌ FAILED:', error);
}

console.log('\nConclusion:');
console.log(
  '- If we include UNTIL in RRule options, it appears in the RRULE line'
);
console.log("- rrulestr() CAN parse UNTIL when it's in the RRULE line");
console.log('- We should NOT manually add UNTIL as a separate line');
console.log(
  '- The database trigger should use rrule library via Edge Function'
);

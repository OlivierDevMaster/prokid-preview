import RRulePkg from 'rrule';
const { rrulestr } = RRulePkg;

console.log(
  'Testing if RRULE library auto-generates DTSTART when not provided...\n'
);

// Test 1: RRULE with explicit DTSTART
console.log('Test 1: RRULE with explicit DTSTART');
const rruleWithDtstart = `DTSTART:20240101T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;
console.log('Input:', rruleWithDtstart);
try {
  const rule1 = rrulestr(rruleWithDtstart);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('DTSTART:', rule1.options.dtstart);
  console.log('DTSTART ISO:', rule1.options.dtstart?.toISOString());
  console.log('Full options:', JSON.stringify(rule1.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

// Test 2: RRULE without DTSTART (what we're testing)
console.log('Test 2: RRULE without DTSTART (testing auto-generation)');
const rruleWithoutDtstart = `RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;
console.log('Input:', rruleWithoutDtstart);
const beforeParse = new Date();
try {
  const rule2 = rrulestr(rruleWithoutDtstart);
  const afterParse = new Date();
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('DTSTART:', rule2.options.dtstart);
  console.log('DTSTART ISO:', rule2.options.dtstart?.toISOString());
  console.log('Parse time (before):', beforeParse.toISOString());
  console.log('Parse time (after):', afterParse.toISOString());

  if (rule2.options.dtstart) {
    const dtstartTime = rule2.options.dtstart.getTime();
    const beforeTime = beforeParse.getTime();
    const afterTime = afterParse.getTime();

    console.log('\n📊 Analysis:');
    console.log('DTSTART timestamp:', dtstartTime);
    console.log('Before parse timestamp:', beforeTime);
    console.log('After parse timestamp:', afterTime);

    // Check if DTSTART is close to current time (within 1 second)
    const timeDiff = Math.abs(dtstartTime - beforeTime);
    if (timeDiff < 1000) {
      console.log(
        '⚠️  DTSTART appears to be auto-generated (close to parse time)'
      );
      console.log('   Time difference:', timeDiff, 'ms');
    } else {
      console.log('✅ DTSTART does not appear to be auto-generated');
      console.log('   Time difference:', timeDiff, 'ms');
    }
  } else {
    console.log('✅ DTSTART is null (not auto-generated)');
  }

  console.log('\nFull options:', JSON.stringify(rule2.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

// Test 3: RRULE with UNTIL but no DTSTART
console.log('Test 3: RRULE with UNTIL but no DTSTART');
const rruleWithUntilNoDtstart = `RRULE:FREQ=DAILY;INTERVAL=1;UNTIL=20240131T180000Z`;
console.log('Input:', rruleWithUntilNoDtstart);
const beforeParse3 = new Date();
try {
  const rule3 = rrulestr(rruleWithUntilNoDtstart);
  console.log('✅ SUCCESS: Parsed successfully');
  console.log('DTSTART:', rule3.options.dtstart);
  console.log('DTSTART ISO:', rule3.options.dtstart?.toISOString());
  console.log('UNTIL:', rule3.options.until);
  console.log('UNTIL ISO:', rule3.options.until?.toISOString());

  if (rule3.options.dtstart) {
    const dtstartTime = rule3.options.dtstart.getTime();
    const beforeTime = beforeParse3.getTime();
    const timeDiff = Math.abs(dtstartTime - beforeTime);

    console.log('\n📊 Analysis:');
    if (timeDiff < 1000) {
      console.log(
        '⚠️  DTSTART appears to be auto-generated (close to parse time)'
      );
      console.log('   Time difference:', timeDiff, 'ms');
    } else {
      console.log('✅ DTSTART does not appear to be auto-generated');
      console.log('   Time difference:', timeDiff, 'ms');
    }
  } else {
    console.log('✅ DTSTART is null (not auto-generated)');
  }

  console.log('\nFull options:', JSON.stringify(rule3.options, null, 2));
} catch (error) {
  console.log('❌ FAILED:', error);
}
console.log('');

// Test 4: Multiple parses to see if DTSTART changes
console.log(
  'Test 4: Multiple parses to see if DTSTART changes (auto-generation test)'
);
const rruleNoDtstart = `RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR`;
console.log('Input:', rruleNoDtstart);
console.log('Parsing 3 times with delays...\n');

async function runMultipleParses() {
  for (let i = 1; i <= 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
    const parseTime = new Date();
    try {
      const rule = rrulestr(rruleNoDtstart);
      console.log(`Parse ${i}:`);
      console.log('  Parse time:', parseTime.toISOString());
      console.log('  DTSTART:', rule.options.dtstart?.toISOString());
      if (rule.options.dtstart) {
        const diff = Math.abs(
          rule.options.dtstart.getTime() - parseTime.getTime()
        );
        console.log('  Time diff:', diff, 'ms');
      }
    } catch (error) {
      console.log(`Parse ${i}: ❌ FAILED:`, error);
    }
  }

  console.log('\n📝 Summary:');
  console.log(
    'If DTSTART is auto-generated, it should be close to the parse time'
  );
  console.log(
    'If DTSTART is null or far from parse time, it is not auto-generated'
  );
}

runMultipleParses();

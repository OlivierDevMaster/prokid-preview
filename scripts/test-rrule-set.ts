import { datetime, RRule, RRuleSet } from 'rrule';

const rruleSet = new RRuleSet();

// Add a rrule to rruleSet
rruleSet.rrule(
  new RRule({
    count: 5,
    dtstart: datetime(2012, 2, 1, 10, 30),
    freq: RRule.MONTHLY,
    until: datetime(2012, 5, 1, 10, 30),
  })
);

rruleSet.rrule(
  new RRule({
    count: 2,
    dtstart: datetime(2012, 6, 1, 11, 0),
    freq: RRule.WEEKLY,
  })
);

// Add a date to rruleSet
rruleSet.rdate(datetime(2012, 7, 1, 10, 30));

// Add another date to rruleSet
rruleSet.rdate(datetime(2012, 7, 2, 10, 30));

// Add a exclusion rrule to rruleSet
rruleSet.exrule(
  new RRule({
    count: 2,
    dtstart: datetime(2012, 3, 1, 10, 30),
    freq: RRule.MONTHLY,
  })
);

// Add a exclusion date to rruleSet
rruleSet.exdate(datetime(2012, 5, 1, 10, 30));

// Get all occurrence dates (Date instances):
const all = rruleSet.all();
console.log(all);
/*
[
    ('2012-02-01T10:30:00.000Z',
  '2012-05-01T10:30:00.000Z',
  '2012-07-01T10:30:00.000Z',
  '2012-07-02T10:30:00.000Z')
]; */

// Get a slice:
const between = rruleSet.between(datetime(2012, 2, 1), datetime(2012, 6, 2));
console.log(between);
/* [
  ('2012-05-01T10:30:00.000Z', '2012-07-01T10:30:00.000Z')
];
 */
// To string
const valueOf = rruleSet.valueOf();
console.log(valueOf);
/* [
  ('DTSTART:20120201T023000Z',
  'RRULE:FREQ=MONTHLY;COUNT=5',
  'RDATE:20120701T023000Z,20120702T023000Z',
  'EXRULE:FREQ=MONTHLY;COUNT=2',
  'EXDATE:20120601T023000Z')
];
 */
// To string
const toString = rruleSet.toString();
console.log(toString);
/*
('["DTSTART:20120201T023000Z","RRULE:FREQ=MONTHLY;COUNT=5","RDATE:20120701T023000Z,20120702T023000Z","EXRULE:FREQ=MONTHLY;COUNT=2","EXDATE:20120601T023000Z"]');
 */

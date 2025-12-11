import RRulePkg from 'rrule';
const { RRule, rrulestr } = RRulePkg;

/**
 * Constrains an RRULE by mission start and end dates.
 * Extracts the time from the RRULE's DTSTART and applies it to the mission date range.
 * Preserves EXDATE exceptions and ensures UNTIL is set.
 *
 * @param rrule - RRULE string (RFC 5545 format, newline-separated)
 * @param missionDtstart - Mission start date
 * @param missionUntil - Mission end date
 * @returns Constrained RRULE string with mission date boundaries
 */
export function constrainRRULEByDates(
  rrule: string,
  missionDtstart: Date,
  missionUntil: Date
): string {
  // Parse the RRULE - extract only parseable parts (DTSTART and RRULE lines)
  // Remove EXDATE lines for parsing, we'll add them back later
  const parseableRRULE = extractParseableRRULE(rrule);
  const rule = rrulestr(parseableRRULE);

  // Extract time components from RRULE's DTSTART
  const originalDtstart = rule.options.dtstart || new Date();
  const hour = originalDtstart.getUTCHours();
  const minute = originalDtstart.getUTCMinutes();
  const second = originalDtstart.getUTCSeconds();

  // Create new DTSTART: mission start date with original time
  const newDtstart = new Date(missionDtstart);
  newDtstart.setUTCHours(hour, minute, second, 0);

  // Create new UNTIL: mission end date with original time
  const newUntil = new Date(missionUntil);
  newUntil.setUTCHours(hour, minute, second, 0);

  // Build RRULE options from original pattern
  // Include 'until' in options - the rrule library supports it and formats it correctly
  const rruleOptions: RRulePkg.Options = {
    bymonth: rule.options.bymonth,
    bymonthday: rule.options.bymonthday,
    bysetpos: rule.options.bysetpos,
    byweekday: rule.options.byweekday,
    byweekno: rule.options.byweekno,
    byyearday: rule.options.byyearday,
    dtstart: newDtstart,
    freq: rule.options.freq,
    interval: rule.options.interval,
    until: newUntil,
    wkst: rule.options.wkst,
  };

  // Remove bysetpos if present (can conflict with UNTIL when modifying DTSTART)
  delete rruleOptions.bysetpos;

  // Create new RRULE with mission date constraints (including UNTIL in options)
  const newRRule = new RRule(rruleOptions);

  // Get the formatted RRULE string from the library
  // The library formats it as: DTSTART:...\nRRULE:...;UNTIL=...
  const formattedRRULE = newRRule.toString();

  // Get EXDATE from original RRULE if present
  const exdateLines: string[] = [];
  const rruleLines = rrule.split('\n');
  for (const line of rruleLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('EXDATE:')) {
      exdateLines.push(trimmed);
    }
  }

  // Combine all parts - the library already includes DTSTART and RRULE with UNTIL
  let result = formattedRRULE;
  if (exdateLines.length > 0) {
    result += '\n' + exdateLines.join('\n');
  }

  return result;
}

/**
 * @deprecated Use constrainRRULEByDates instead. This function is kept for backward compatibility.
 * Generates a mission schedule RRULE from an availability pattern,
 * constrained by mission start and end dates.
 */
export function generateMissionScheduleRRULE(
  availabilityRRULE: string,
  missionDtstart: Date,
  missionUntil: Date
): string {
  return constrainRRULEByDates(availabilityRRULE, missionDtstart, missionUntil);
}

/**
 * Extracts just the parseable parts of an RRULE string (DTSTART and RRULE lines)
 * Removes EXDATE lines for parsing (they'll be added back later)
 * @param rruleString - Full RRULE string with DTSTART, RRULE, UNTIL, EXDATE lines
 * @returns String with only DTSTART and RRULE lines (parseable by rrulestr)
 */
function extractParseableRRULE(rruleString: string): string {
  const lines = rruleString.split('\n');
  const parseableLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DTSTART:') || trimmed.startsWith('RRULE:')) {
      parseableLines.push(trimmed);
    }
    // Skip UNTIL and EXDATE lines - they can't be parsed by rrulestr()
  }

  return parseableLines.join('\n');
}

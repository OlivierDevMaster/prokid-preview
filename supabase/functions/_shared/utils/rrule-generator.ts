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
  // Parse the RRULE
  const rule = rrulestr(rrule);

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

  // Create new RRULE with mission date constraints
  const newRRule = new RRule(rruleOptions);

  // Build the complete RRULE string
  // Format: DTSTART:YYYYMMDDTHHMMSSZ\nRRULE:...\nUNTIL:YYYYMMDDTHHMMSSZ
  const dtstartStr = formatDateForRRULE(newDtstart);
  const rruleStr = newRRule.toString();
  const untilStr = formatDateForRRULE(newUntil);

  // Get EXDATE from original RRULE if present
  const exdateLines: string[] = [];
  const rruleLines = rrule.split('\n');
  for (const line of rruleLines) {
    if (line.startsWith('EXDATE:')) {
      exdateLines.push(line);
    }
  }

  // Combine all parts
  let result = `DTSTART:${dtstartStr}\n${rruleStr}`;
  // Always add UNTIL to ensure the RRULE is bounded by mission dates
  result += `\nUNTIL:${untilStr}`;
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
 * Formats a Date object to RRULE DTSTART/UNTIL format (YYYYMMDDTHHMMSSZ)
 */
function formatDateForRRULE(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');
  const second = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

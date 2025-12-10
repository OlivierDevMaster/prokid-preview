import RRulePkg from 'rrule';
const { RRule, rrulestr } = RRulePkg;

/**
 * Generates a mission schedule RRULE from an availability pattern,
 * constrained by mission start and end dates.
 *
 * @param availabilityRRULE - Original availability RRULE string
 * @param missionDtstart - Mission start date
 * @param missionUntil - Mission end date
 * @returns Generated RRULE string with mission date constraints
 */
export function generateMissionScheduleRRULE(
  availabilityRRULE: string,
  missionDtstart: Date,
  missionUntil: Date
): string {
  // Parse the availability RRULE
  const availabilityRule = rrulestr(availabilityRRULE);

  // Extract time components from availability DTSTART
  const availabilityDtstart = availabilityRule.options.dtstart || new Date();
  const hour = availabilityDtstart.getUTCHours();
  const minute = availabilityDtstart.getUTCMinutes();
  const second = availabilityDtstart.getUTCSeconds();

  // Create new DTSTART: mission start date with availability time
  const newDtstart = new Date(missionDtstart);
  newDtstart.setUTCHours(hour, minute, second, 0);

  // Create new UNTIL: mission end date with availability time
  const newUntil = new Date(missionUntil);
  newUntil.setUTCHours(hour, minute, second, 0);

  // Build RRULE options from availability pattern
  const rruleOptions: RRulePkg.Options = {
    bymonth: availabilityRule.options.bymonth,
    bymonthday: availabilityRule.options.bymonthday,
    bysetpos: availabilityRule.options.bysetpos,
    byweekday: availabilityRule.options.byweekday,
    byweekno: availabilityRule.options.byweekno,
    byyearday: availabilityRule.options.byyearday,
    dtstart: newDtstart,
    freq: availabilityRule.options.freq,
    interval: availabilityRule.options.interval,
    until: newUntil,
    wkst: availabilityRule.options.wkst,
  };

  // Create new RRULE with mission date constraints
  const newRRule = new RRule(rruleOptions);

  // Build the complete RRULE string
  // Format: DTSTART:YYYYMMDDTHHMMSSZ\nRRULE:...\nUNTIL:YYYYMMDDTHHMMSSZ
  const dtstartStr = formatDateForRRULE(newDtstart);
  const rruleStr = newRRule.toString();
  const untilStr = formatDateForRRULE(newUntil);

  // Get EXDATE from original availability if present
  const exdateLines: string[] = [];
  const rruleLines = availabilityRRULE.split('\n');
  for (const line of rruleLines) {
    if (line.startsWith('EXDATE:')) {
      exdateLines.push(line);
    }
  }

  // Combine all parts
  let result = `DTSTART:${dtstartStr}\n${rruleStr}`;
  if (untilStr) {
    result += `\nUNTIL:${untilStr}`;
  }
  if (exdateLines.length > 0) {
    result += '\n' + exdateLines.join('\n');
  }

  return result;
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

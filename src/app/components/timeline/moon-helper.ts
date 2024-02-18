import { round } from 'lodash';
import { MoonMode } from 'src/app/models/options';

const LUNAR_CYCLE = 29.5305882; // 29.53058770576
const DAYS_PER_YEAR = 365.25;
const DAYS_PER_MONTH = 30.6;
// Number of days since known new moon on `1900-01-01`.
const DAYS_SINCE_NEW_MOON_1900_01_01 = 694039.09;

let moonIcons: [
  New: string,
  WaxingCrescent: string,
  QuarterMoon: string,
  WaxingGibbous: string,
  Full: string,
  WaningGibbous: string,
  LastQuarter: string,
  WaningCrescent: string
] = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

export function getMoonIcon(dateStr: string, moonMode?: MoonMode): string {
  let date = new Date(dateStr);
  return moonPhase(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    moonMode
  );
}

export function moonPhaseAlt(
  moonMode?: MoonMode,
  date: Date = new Date()
): string {
  // let year = date.getYear()
  let year: number = date.getFullYear();

  let month: number = date.getMonth() + 1;
  const day: number = date.getDate();
  return moonPhase(year, month, day, moonMode);
}

// Ported from `http://www.voidware.com/moon_phase.htm`.
export function moonPhase(
  year: number,
  month: number,
  day: number,
  moonMode?: MoonMode
): string {
  if (month < 3) {
    year--;
    month += 12;
  }

  month += 1;

  let totalDaysElapsed: number =
    DAYS_PER_YEAR * year +
    DAYS_PER_MONTH * month +
    day -
    DAYS_SINCE_NEW_MOON_1900_01_01;

  totalDaysElapsed /= LUNAR_CYCLE; // Divide by the lunar cycle.

  let phase: number = Math.trunc(totalDaysElapsed);

  /*
      Subtract integer part to leave fractional part of original
      `totalDaysElapsed`.
    */
  totalDaysElapsed -= phase;

  // Scale fraction from `0-8`.
  phase = round(totalDaysElapsed * 8);
  if (phase > moonIcons.length || phase < 0) {
    return '';
  }

  if (phase >= 8) phase = 0; // `0` and `8` are the same so turn `8` into `0`.

  //return correct string based on setting
  if (moonMode !== undefined) {
    if (moonMode == MoonMode.All) {
      return moonIcons[phase];
    } else if (moonMode == MoonMode.FullMoonOnly) {
      if (phase == 4) {
        return moonIcons[phase];
      } else {
        return '';
      }
    } else if (moonMode == MoonMode.None) {
      return '';
    }
  }
  return moonIcons[phase];
}

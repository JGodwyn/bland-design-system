import { useMemo } from 'react';
import { parseDate, parseTime, type CalendarDate, type Time } from '@internationalized/date';
import type { DateValue } from 'react-stately';

/**
 * Bland's date and time components take and return ISO strings (Godwin 2026-10-19), the same as native date and
 * time inputs: a date is `"2024-11-09"`, a time `"14:30"` (24-hour, `"14:30:15"` with seconds). React Aria works
 * on `@internationalized/date` objects inside; these helpers convert at the edge.
 */

/** A range of dates, both ends included. */
export interface DateRange {
  start: string;
  end: string;
}

/** `"2024-11-09"` → CalendarDate; `null` or `undefined` pass through; anything unparseable is `null`. */
export function toDate(value: string | null | undefined): CalendarDate | null | undefined {
  if (value == null) return value;
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

/** Like `toDate`, for props React Aria types as optional (`undefined`, never `null`). */
export function toDateOpt(value: string | null | undefined): CalendarDate | undefined {
  return toDate(value) ?? undefined;
}

/** Any React Aria date value → `"2024-11-09"`. */
export function fromDate(value: DateValue): string;
export function fromDate(value: DateValue | null | undefined): string | null;
export function fromDate(value: DateValue | null | undefined): string | null {
  if (!value) return null;
  const { year, month, day } = value;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toRange(value: DateRange | null | undefined) {
  if (value == null) return value;
  const start = toDate(value.start);
  const end = toDate(value.end);
  return start && end ? { start, end } : null;
}

export function fromRange(value: { start: DateValue; end: DateValue } | null | undefined): DateRange | null {
  return value ? { start: fromDate(value.start), end: fromDate(value.end) } : null;
}

/** `"14:30"` or `"14:30:15"` → Time. */
export function toTime(value: string | null | undefined): Time | null | undefined {
  if (value == null) return value;
  try {
    return parseTime(value);
  } catch {
    return null;
  }
}

/** Time → `"14:30"`, or `"14:30:15"` when `seconds`. */
export function fromTime(value: Time | null | undefined, seconds: boolean): string | null {
  if (!value) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(value.hour)}:${pad(value.minute)}${seconds ? `:${pad(value.second)}` : ''}`;
}

/*
 * Hooks for props: parse once per string, so a controlled value keeps the same object between renders. React
 * Aria's field state treats a new object as a new value and resets itself during render, which loops.
 */
export const useDateProp = (value: string | null | undefined) => useMemo(() => toDate(value), [value]);
export const useDateOptProp = (value: string | null | undefined) => useMemo(() => toDateOpt(value), [value]);
export const useTimeProp = (value: string | null | undefined) => useMemo(() => toTime(value), [value]);
export function useRangeProp(value: DateRange | null | undefined) {
  const start = value?.start;
  const end = value?.end;
  const none = value === undefined ? undefined : value === null ? null : false;
  return useMemo(() => (none === false ? toRange({ start: start!, end: end! }) : none), [none, start, end]);
}

import { addDays, set, subDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import {
  CLINIC_TIMEZONE,
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
} from '../constants/clinic.constants';

export function buildFollowUpDates(visitAt: Date, followUpDays: number) {
  const dueAt = addDays(visitAt, followUpDays);
  const dueAtInClinicTimezone = toZonedTime(dueAt, CLINIC_TIMEZONE);
  const reminderLocalTime = set(subDays(dueAtInClinicTimezone, 1), {
    hours: DEFAULT_REMINDER_HOUR,
    minutes: DEFAULT_REMINDER_MINUTE,
    seconds: 0,
    milliseconds: 0,
  });

  return {
    dueAt,
    reminderAt: fromZonedTime(reminderLocalTime, CLINIC_TIMEZONE),
  };
}

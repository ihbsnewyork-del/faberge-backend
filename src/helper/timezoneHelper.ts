import { format, toZonedTime, fromZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";

/**
 * Converts a date from client timezone to UTC for storage
 * @param dateString - Date string from client (e.g., "2024-02-15")
 * @param timeString - Time string in 24hr format (e.g., "14:30")
 * @param clientTimezone - Client's timezone (e.g., "America/New_York", "Asia/Dhaka")
 * @returns UTC Date object
 */
export const convertToUTC = (
  dateString: string,
  timeString: string,
  clientTimezone: string,
): Date => {
  // Combine date and time
  const dateTimeString = `${dateString}T${timeString}:00`;

  // Parse as if it's in the client's timezone
  const clientDate = new Date(dateTimeString);

  // Convert from client timezone to UTC
  const utcDate = fromZonedTime(clientDate, clientTimezone);

  return utcDate;
};

/**
 * Converts UTC date to client timezone
 * @param utcDate - UTC Date object from database
 * @param clientTimezone - Client's timezone
 * @returns Object with date and time in client timezone
 */
export const convertFromUTC = (
  utcDate: Date,
  clientTimezone: string,
): { date: string; time: string; dateTime: Date } => {
  // Convert UTC to client timezone
  const zonedDate = toZonedTime(utcDate, clientTimezone);

  return {
    date: format(zonedDate, "yyyy-MM-dd", { timeZone: clientTimezone }),
    time: format(zonedDate, "HH:mm", { timeZone: clientTimezone }),
    dateTime: zonedDate,
  };
};

/**
 * Get current date/time in specific timezone
 * @param timezone - Target timezone
 * @returns Current date/time in specified timezone
 */
export const getCurrentTimeInTimezone = (
  timezone: string,
): {
  date: string;
  time: string;
  dateTime: Date;
} => {
  const now = new Date();
  const zonedDate = toZonedTime(now, timezone);

  return {
    date: format(zonedDate, "yyyy-MM-dd", { timeZone: timezone }),
    time: format(zonedDate, "HH:mm", { timeZone: timezone }),
    dateTime: zonedDate,
  };
};

/**
 * Convert time string from one timezone to another
 * @param dateString - Date in YYYY-MM-DD format
 * @param timeString - Time in HH:mm format
 * @param fromTimezone - Source timezone
 * @param toTimezone - Target timezone
 * @returns Converted date and time
 */
export const convertBetweenTimezones = (
  dateString: string,
  timeString: string,
  fromTimezone: string,
  toTimezone: string,
): { date: string; time: string } => {
  const dateTimeString = `${dateString}T${timeString}:00`;
  const sourceDate = new Date(dateTimeString);

  // First convert to UTC
  const utcDate = fromZonedTime(sourceDate, fromTimezone);

  // Then convert to target timezone
  const targetDate = toZonedTime(utcDate, toTimezone);

  return {
    date: format(targetDate, "yyyy-MM-dd", { timeZone: toTimezone }),
    time: format(targetDate, "HH:mm", { timeZone: toTimezone }),
  };
};

/**
 * Check if a booking time has passed in client timezone
 * @param bookingDate - Booking date from DB (UTC)
 * @param endTime - End time string (HH:mm)
 * @param clientTimezone - Client's timezone
 * @returns boolean indicating if booking has ended
 */
export const hasBookingEnded = (
  bookingDate: Date,
  endTime: string,
  clientTimezone: string,
): boolean => {
  // Get current time in client timezone
  const now = new Date();
  const clientNow = toZonedTime(now, clientTimezone);

  // Convert booking end time to client timezone
  const [hours, minutes] = endTime.split(":").map(Number);
  const bookingEndDate = toZonedTime(bookingDate, clientTimezone);
  bookingEndDate.setHours(hours, minutes, 0, 0);

  return clientNow > bookingEndDate;
};

/**
 * Generate time slots in client timezone
 * @param clientTimezone - Client's timezone
 * @param startHour - Start hour (default 9)
 * @param endHour - End hour (default 19)
 * @param intervalMinutes - Slot interval (default 30)
 * @returns Array of time slots
 */
export const generateTimeSlotsForTimezone = (
  clientTimezone: string,
  startHour: number = 9,
  endHour: number = 19,
  intervalMinutes: number = 30,
): Array<{ startTime: string; endTime: string }> => {
  const slots = [];
  let hour = startHour;
  let minute = 0;

  while (hour < endHour) {
    const start = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    let nextHour = hour;
    let nextMinute = minute + intervalMinutes;

    if (nextMinute >= 60) {
      nextHour += 1;
      nextMinute -= 60;
    }

    if (nextHour > endHour || (nextHour === endHour && nextMinute > 0)) {
      break;
    }

    const end = `${nextHour.toString().padStart(2, "0")}:${nextMinute
      .toString()
      .padStart(2, "0")}`;

    slots.push({ startTime: start, endTime: end });

    hour = nextHour;
    minute = nextMinute;
  }

  return slots;
};

/**
 * Get start and end of day in UTC for a given date and timezone
 * @param dateString - Date string (YYYY-MM-DD)
 * @param clientTimezone - Client's timezone
 * @returns Start and end of day in UTC
 */
export const getDayBoundariesInUTC = (
  dateString: string,
  clientTimezone: string,
): { startOfDay: Date; endOfDay: Date } => {
  const startOfDayClient = new Date(`${dateString}T00:00:00`);
  const endOfDayClient = new Date(`${dateString}T23:59:59.999`);

  const startOfDay = fromZonedTime(startOfDayClient, clientTimezone);
  const endOfDay = fromZonedTime(endOfDayClient, clientTimezone);

  return { startOfDay, endOfDay };
};

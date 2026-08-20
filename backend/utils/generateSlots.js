/**
 * Convert HH:mm to minutes from midnight
 * @param {string} timeStr - e.g. "09:30"
 * @returns {number}
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Convert minutes from midnight to HH:mm string (24h)
 * @param {number} totalMinutes
 * @returns {string} - e.g. "09:30"
 */
export const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
};

/**
 * Generate slots between startTime and endTime
 * @param {string} startTime - e.g. "09:00"
 * @param {string} endTime - e.g. "17:00"
 * @param {number} slotDuration - duration in minutes (e.g. 30)
 * @param {Array} bookedAppointments - existing appointments on the date
 * @returns {Array<{startTime: string, endTime: string, isBooked: boolean}>}
 */
export const generateTimeSlots = (
  startTime,
  endTime,
  slotDuration = 30,
  bookedAppointments = []
) => {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const duration = Number(slotDuration) || 30;

  const slots = [];

  for (let current = startMin; current + duration <= endMin; current += duration) {
    const slotStart = minutesToTime(current);
    const slotEnd = minutesToTime(current + duration);

    // Check if this slot conflicts with any booked appointment
    const isBooked = bookedAppointments.some((appt) => {
      if (appt.status === "cancelled" || appt.status === "rejected") {
        return false;
      }
      const apptStart = timeToMinutes(appt.startTime);
      const apptEnd = timeToMinutes(appt.endTime);
      // Conflict if overlapping
      return current < apptEnd && current + duration > apptStart;
    });

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isBooked,
      isAvailable: !isBooked,
    });
  }

  return slots;
};

export default generateTimeSlots;

export const getJoinButtonState = (appointment, bufferMinutes = 5, isDoctor = false) => {
  if (!appointment || appointment.status !== 'confirmed') {
    return {
      show: false,
      enabled: false,
      text: '',
      variant: 'secondary',
    };
  }

  // Doctor can join confirmed appointments at any time
  if (isDoctor) {
    return {
      show: true,
      enabled: true,
      text: 'Join Now',
      variant: 'success',
    };
  }

  const d = new Date(appointment.appointmentDate);
  const [startHours, startMinutes] = appointment.startTime.split(':').map(Number);
  const [endHours, endMinutes] = appointment.endTime.split(':').map(Number);

  const startUtc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), startHours, startMinutes, 0, 0));
  const endUtc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), endHours, endMinutes, 0, 0));

  const nowRaw = new Date();
  const now = new Date(Date.UTC(
    nowRaw.getFullYear(),
    nowRaw.getMonth(),
    nowRaw.getDate(),
    nowRaw.getHours(),
    nowRaw.getMinutes(),
    nowRaw.getSeconds(),
    0
  ));
  const bufferMs = bufferMinutes * 60 * 1000;
  const activeStart = new Date(startUtc.getTime() - bufferMs);

  if (now < activeStart) {
    const diffMs = startUtc - now;
    const diffMins = Math.ceil(diffMs / (60 * 1000));
    
    let text;
    if (diffMins < 60) {
      text = `Starts in ${diffMins} min`;
    } else {
      text = `Available at ${appointment.startTime}`;
    }

    return {
      show: true,
      enabled: false,
      text,
      variant: 'secondary',
    };
  } else if (now >= activeStart && now <= endUtc) {
    return {
      show: true,
      enabled: true,
      text: 'Join Now',
      variant: 'success',
    };
  } else {
    return {
      show: true,
      enabled: false,
      text: 'Session Ended',
      variant: 'secondary',
    };
  }
};

import React, { createContext, useState, useContext } from 'react';
import appointmentService from '../services/appointmentService.js';

export const AppointmentContext = createContext(null);

export const AppointmentProvider = ({ children }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPatientAppointments = async (params = {}) => {
    setLoading(true);
    try {
      const res = await appointmentService.getPatientAppointments(params);
      setAppointments(res.appointments || []);
      return res.appointments;
    } catch (err) {
      console.error('Fetch appointments failed:', err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearBookingSelection = () => {
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const value = {
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    appointments,
    setAppointments,
    fetchPatientAppointments,
    clearBookingSelection,
    loading,
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};

export default AppointmentContext;

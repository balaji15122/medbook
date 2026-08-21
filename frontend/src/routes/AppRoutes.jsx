import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import PatientLayout from '../layouts/PatientLayout.jsx';
import DoctorLayout from '../layouts/DoctorLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

// Common
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';

// Public Pages
import Home from '../pages/public/Home.jsx';
import Doctors from '../pages/public/Doctors.jsx';
import DoctorDetails from '../pages/public/DoctorDetails.jsx';
import About from '../pages/public/About.jsx';
import Contact from '../pages/public/Contact.jsx';

// Auth Pages
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import ForgotPassword from '../pages/auth/ForgotPassword.jsx';
import ResetPassword from '../pages/auth/ResetPassword.jsx';

// Patient Pages
import PatientDashboard from '../pages/patient/PatientDashboard.jsx';
import MyAppointments from '../pages/patient/MyAppointments.jsx';
import BookAppointment from '../pages/patient/BookAppointment.jsx';
import MedicalRecords from '../pages/patient/MedicalRecords.jsx';
import MyPrescriptions from '../pages/patient/MyPrescriptions.jsx';
import PatientProfile from '../pages/patient/PatientProfile.jsx';
import Payments from '../pages/patient/Payments.jsx';
import Checkout from '../pages/patient/Checkout.jsx';
import PaymentSuccess from '../pages/patient/PaymentSuccess.jsx';
import PaymentFailed from '../pages/patient/PaymentFailed.jsx';

// Doctor Pages
import DoctorDashboard from '../pages/doctor/DoctorDashboard.jsx';
import DoctorAppointments from '../pages/doctor/DoctorAppointments.jsx';
import DoctorPatients from '../pages/doctor/DoctorPatients.jsx';
import DoctorAvailability from '../pages/doctor/DoctorAvailability.jsx';
import DoctorProfile from '../pages/doctor/DoctorProfile.jsx';
import CreatePrescription from '../pages/doctor/CreatePrescription.jsx';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageDoctors from '../pages/admin/ManageDoctors.jsx';
import ManageAppointments from '../pages/admin/ManageAppointments.jsx';
import ManageReviews from '../pages/admin/ManageReviews.jsx';
import Analytics from '../pages/admin/Analytics.jsx';
import VideoConsultation from '../pages/shared/VideoConsultation.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Patient Portal */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="medical-records" element={<MedicalRecords />} />
        <Route path="prescriptions" element={<MyPrescriptions />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="payments" element={<Payments />} />
        <Route path="checkout/:appointmentId" element={<Checkout />} />
        <Route path="payment/success/:paymentId" element={<PaymentSuccess />} />
        <Route path="payment/failed/:paymentId" element={<PaymentFailed />} />
      </Route>

      {/* Doctor Portal */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="prescription/create" element={<CreatePrescription />} />
        <Route path="profile" element={<DoctorProfile />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="appointments" element={<ManageAppointments />} />
        <Route path="reviews" element={<ManageReviews />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* Video Consultation Room */}
      <Route
        path="/consultation/:appointmentId"
        element={
          <ProtectedRoute allowedRoles={['patient', 'doctor']}>
            <VideoConsultation />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

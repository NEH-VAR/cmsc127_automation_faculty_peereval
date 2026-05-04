import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import DeanDashboard from '../components/admin/DeanDashboard';
import ClientForms from '../components/ClientForms';
import ClientNominate from '../components/ClientNominate';
import AdminLogin from '../components/AdminLogin';
import ClientAssurancePage from '../components/ClientAssurancePage';

const AppRoutes = ({ isAuthenticated, onLoginSuccess, onLogout }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dean-dashboard" replace />
          ) : (
            <AdminLogin onLoginSuccess={onLoginSuccess} />
          )
        }
      />
      <Route path="/dean-dashboard" element={<DeanDashboard onLogout={onLogout} />} />
      <Route path="/client-forms" element={<ClientForms />} />
      <Route path="/client-nominate" element={<ClientNominate name="Cabilatazan" />} />
      <Route path="/client-assurance" element={<ClientAssurancePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

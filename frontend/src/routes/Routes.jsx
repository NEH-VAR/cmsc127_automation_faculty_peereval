import React from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import DeanDashboard from '../components/admin/DeanDashboard';
import ClientForms from '../components/ClientForms';
import ClientNominate from '../components/ClientNominate';
import AdminLogin from '../components/AdminLogin';
import ClientAssurancePage from '../components/ClientAssurancePage';
import EvaluateRoute from '../components/EvaluateRoute';

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
      <Route path="/dean-deashboard" element={<Navigate to="/dean-dashboard" replace />} />
      <Route path="/faculty-nominations" element={<DeanDashboard onLogout={onLogout} />} />
      <Route path="/questions" element={<DeanDashboard onLogout={onLogout} />} />
      <Route path="/dashboard" element={<DeanDashboard onLogout={onLogout} />} />
      <Route path="/client-forms" element={<ClientForms />} />
      <Route path="/nominate" element={<ClientNominate />} />
      <Route path="/client-nominate" element={<ClientNominate />} />
      <Route path="/client-assurance" element={<ClientAssurancePage />} />
      <Route path="/evaluate" element={<EvaluateRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

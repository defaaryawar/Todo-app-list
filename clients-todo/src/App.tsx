// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  ToastProvider,
  Toast,
  ToastViewport
} from './components/ui/toast';
import AuthPage from './pages/AuthPage';
import TodosPage from './pages/TodosPage';
import DashboardPage from './pages/DashbaordPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="todos" element={<TodosPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastViewport />
      <Toast />
    </ToastProvider>
  );
}

export default App;
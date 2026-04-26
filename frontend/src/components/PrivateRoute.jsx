import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute({ allowedRole }) {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (!token) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;

  return <Outlet />;
}

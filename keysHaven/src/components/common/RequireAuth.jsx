import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

export default function RequireAuth({ roles }) {
  const { user, isAuthenticated, loading, token, error } = useAppSelector(state => state.auth);
  const location = useLocation();
  if (loading) return <div className="container py-4">Verificando sesión...</div>;
  if (!isAuthenticated) {
    if (token && error) return <div className="container py-4">No se pudo verificar la sesión. Recargá la página para reintentar.</div>;
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user?.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}

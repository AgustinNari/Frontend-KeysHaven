import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import ConfirmModal from '../profile/ConfirmModal';
import PaginationBar from '../catalog/PaginationBar';

import {
  fetchUsersPage as fetchAdminUsersPage,
  adminUpdateUser,
  setUsersPageFromCache
} from '../../redux/slices/adminPanelSlice';

export default function UserManagement() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector(state => state.adminPanel);
  const usersPage = admin?.usersPage ?? null;
  const users = usersPage?.content ?? [];

  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirm, setConfirm] = useState({ show: false, title: '', message: '', onConfirm: null });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, usersPage?.totalPages ?? 1);

  useEffect(() => {
    const pageRequested = Math.max(1, Number(page) || 1);
    const cacheKey = `${pageRequested}_${pageSize}`;

    const cached = admin?.usersPageCache?.[cacheKey];
    if (cached) {
      dispatch(setUsersPageFromCache({ key: cacheKey }));
      return;
    }

    loadUsers(pageRequested);
  }, [page, dispatch, admin?.usersPageCache]);

  const loadUsers = async (page1based = 1) => {
    setLoadingLocal(true);
    setError('');
    try {
      await dispatch(fetchAdminUsersPage({ page: page1based, size: pageSize })).unwrap();
    } catch (err) {
      console.error('loadUsers err', err);
      setError('Error cargando usuarios');
    } finally {
      setLoadingLocal(false);
    }
  };

  const closeConfirm = () => setConfirm({ show: false, title: '', message: '', onConfirm: null });

  const handleToggleRequest = (user) => {
    if (user.active) {
      setConfirm({
        show: true,
        title: 'Desactivar Usuario',
        message: `¿Estás seguro que querés desactivar a "${user.displayName || user.email}"? Podrás activarlo luego.`,
        onConfirm: () => handleDeactivateConfirmed(user.id)
      });
    } else {
      handleActivate(user.id);
    }
  };

  const handleDeactivateConfirmed = async (userId) => {
    setLoadingLocal(true);
    try {
      const updatedUser = await dispatch(adminUpdateUser({ userId, payload: { active: false } })).unwrap();
    } catch (err) {
      console.error(err);
      setError('Error desactivando usuario');
    } finally {
      setLoadingLocal(false);
      closeConfirm();
    }
  };

  const handleActivate = async (userId) => {
    setLoadingLocal(true);
    try {
      await dispatch(adminUpdateUser({ userId, payload: { active: true } })).unwrap();
    } catch (err) {
      console.error(err);
      setError('Error activando usuario');
    } finally {
      setLoadingLocal(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const nameOrEmail = ((user.displayName || `${user.firstName || ''} ${user.lastName || ''}`) + (user.email || '')).toLowerCase();
    const matchesSearch = nameOrEmail.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.active : !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión de Usuarios</h5>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row mb-4">
          <div className="col-md-4">
            <label className="form-label text-primary-light">Buscar</label>
            <input type="text" className="form-control bg-dark border-secondary text-white" placeholder="Nombre o email..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label text-primary-light">Rol</label>
            <select className="form-select bg-dark border-secondary text-white" value={roleFilter} onChange={(e)=>setRoleFilter(e.target.value)}>
              <option value="all">Todos los roles</option>
              <option value="BUYER">Comprador</option>
              <option value="SELLER">Vendedor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-primary-light">Estado</label>
            <select className="form-select bg-dark border-secondary text-white" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}>
              Limpiar
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-borderless">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último Login</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(loadingLocal && !users.length) ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">Cargando usuarios...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {user.avatarDataUrl && <img src={user.avatarDataUrl} alt="Avatar" className="rounded-circle me-3" style={{width:40,height:40,objectFit:'cover'}} />}
                      <div>
                        <div className="text-primary-light fw-bold">{user.displayName || `${user.firstName} ${user.lastName}`}</div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'bg-warning text-dark' : user.role === 'SELLER' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                      {user.role === 'ADMIN' ? 'Administrador' : user.role === 'SELLER' ? 'Vendedor' : 'Comprador'}
                    </span>
                  </td>
                  <td><span className={`badge ${user.active ? 'bg-success' : 'bg-danger'}`}>{user.active ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="text-muted">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" onClick={() => setViewingUser(user)}>Ver</button>
                      <button className="btn btn-outline-warning" onClick={() => handleToggleRequest(user)} disabled={loadingLocal}>
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loadingLocal && filteredUsers.length === 0 && <div className="text-center text-muted py-4">No se encontraron usuarios</div>}
        </div>

        <div className="d-flex justify-content-center mt-3">
          <PaginationBar page={page} setPage={setPage} totalPages={totalPages} />
        </div>

        {viewingUser && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content bg-primary-dark">
                <div className="modal-header">
                  <h5 className="modal-title text-primary-light">Detalles de Usuario</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setViewingUser(null)}></button>
                </div>
                <div className="modal-body">
                  <p><strong>Nombre:</strong> {viewingUser.displayName || `${viewingUser.firstName} ${viewingUser.lastName}`}</p>
                  <p><strong>Email:</strong> {viewingUser.email}</p>
                  <p><strong>Rol:</strong> {viewingUser.role}</p>
                  <p><strong>País:</strong> {viewingUser.country}</p>
                  <p><strong>Phone:</strong> {viewingUser.phone}</p>
                  <p><strong>Descripción vendedor:</strong> {viewingUser.sellerDescription}</p>
                  <p><strong>Activo:</strong> {viewingUser.active ? 'Sí' : 'No'}</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setViewingUser(null)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          show={confirm.show}
          title={confirm.title}
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }}
          onCancel={closeConfirm}
          confirmText="Desactivar"
          cancelText="Cancelar"
        />
      </div>
    </div>
  );
}

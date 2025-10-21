import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser } from '../../services/adminService';
import ConfirmModal from '../profile/ConfirmModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewingUser, setViewingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirm, setConfirm] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
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
    setLoading(true);
    try {

      await updateUser(userId, { active: false });
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError('Error desactivando usuario');
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const handleActivate = async (userId) => {
    setLoading(true);
    try {
      await updateUser(userId, { active: true });
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError('Error activando usuario');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.displayName || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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
            <button className="btn btn-outline-secondary w-100" onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }}>Limpiar</button>
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
              {loading ? (
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
                      <button className="btn btn-outline-warning" onClick={() => handleToggleRequest(user)} disabled={loading}>
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && filteredUsers.length === 0 && <div className="text-center text-muted py-4">No se encontraron usuarios</div>}
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

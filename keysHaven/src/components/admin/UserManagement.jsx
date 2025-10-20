import React, { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser } from '../../services/adminService';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser(editingUser.id, userData);
      setEditingUser(null);
      await loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error actualizando usuario:', err);
      setError('Error al actualizar usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
      await deleteUser(userId);
      await loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      setError('Error al eliminar usuario');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateUser(user.id, { active: !user.active });
      await loadUsers(); // Recargar lista
    } catch (err) {
      console.error('Error actualizando estado:', err);
      setError('Error al actualizar estado');
    }
  };

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? user.active : !user.active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="card bg-primary-dark border-0">
      <div className="card-header bg-primary-mid">
        <h5 className="text-primary-light mb-0">Gestión de Usuarios</h5>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="row mb-4">
          <div className="col-md-4">
            <label className="form-label text-primary-light">Buscar</label>
            <input
              type="text"
              className="form-control bg-dark border-secondary text-white"
              placeholder="Nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-primary-light">Rol</label>
            <select
              className="form-select bg-dark border-secondary text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="BUYER">Comprador</option>
              <option value="SELLER">Vendedor</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-primary-light">Estado</label>
            <select
              className="form-select bg-dark border-secondary text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de Usuarios */}
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
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    Cargando usuarios...
                  </td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {user.avatarDataUrl && (
                        <img 
                          src={user.avatarDataUrl} 
                          alt="Avatar"
                          className="rounded-circle me-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      )}
                      <div>
                        <div className="text-primary-light fw-bold">
                          {user.displayName || `${user.firstName} ${user.lastName}`}
                        </div>
                        <small className="text-muted">{user.email}</small>
                        {user.sellerDescription && (
                          <div className="text-muted small mt-1">
                            {user.sellerDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === 'ADMIN' ? 'bg-warning text-dark' : 
                      user.role === 'SELLER' ? 'bg-info text-dark' : 'bg-secondary'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' :
                       user.role === 'SELLER' ? 'Vendedor' : 'Comprador'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.active ? 'bg-success' : 'bg-danger'}`}>
                      {user.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setEditingUser(user)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center text-muted py-4">
              No se encontraron usuarios que coincidan con los filtros
            </div>
          )}
        </div>

        {/* Modal de Edición */}
        {editingUser && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content bg-primary-dark">
                <div className="modal-header">
                  <h5 className="modal-title text-primary-light">Editar Usuario</h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setEditingUser(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <UserEditForm 
                    user={editingUser}
                    onSave={handleUpdateUser}
                    onCancel={() => setEditingUser(null)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de formulario de edición
function UserEditForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phone: user.phone || '',
    sellerDescription: user.sellerDescription || '',
    country: user.country || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label text-primary-light">Nombre para mostrar</label>
          <input
            type="text"
            className="form-control bg-dark border-secondary text-white"
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label text-primary-light">Teléfono</label>
          <input
            type="text"
            className="form-control bg-dark border-secondary text-white"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label text-primary-light">Nombre</label>
          <input
            type="text"
            className="form-control bg-dark border-secondary text-white"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label text-primary-light">Apellido</label>
          <input
            type="text"
            className="form-control bg-dark border-secondary text-white"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label text-primary-light">País</label>
          <input
            type="text"
            className="form-control bg-dark border-secondary text-white"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
          />
        </div>
        <div className="col-12 mb-3">
          <label className="form-label text-primary-light">Descripción de Vendedor</label>
          <textarea
            className="form-control bg-dark border-secondary text-white"
            rows="3"
            value={formData.sellerDescription}
            onChange={(e) => setFormData({...formData, sellerDescription: e.target.value})}
          />
        </div>
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary">Guardar</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
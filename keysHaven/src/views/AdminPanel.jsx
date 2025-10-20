import React, { useState } from 'react';

export default function AdminPanel() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      role: "Usuario",
      status: "Active",
      joinDate: "2023-01-15"
    },
    {
      id: 2,
      name: "Sofía Ramírez", 
      email: "sofia.ramirez@example.com",
      role: "Usuario",
      status: "Active",
      joinDate: "2023-02-20"
    },
    {
      id: 3,
      name: "Diego Herrera",
      email: "diego.herrera@example.com",
      role: "Administrador",
      status: "Active",
      joinDate: "2022-11-05"
    },
    {
      id: 4,
      name: "Isabella Torres",
      email: "isabella.torres@example.com",
      role: "Usuario",
      status: "Inactivo",
      joinDate: "2023-03-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [editingUser, setEditingUser] = useState(null);

  // Función para eliminar usuario
  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  // Función para editar usuario
  const handleEditUser = (user) => {
    setEditingUser({...user});
  };

  // Función para guardar edición
  const handleSaveEdit = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      setEditingUser(null);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  // Filtrar y ordenar usuarios
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'email':
          return a.email.localeCompare(b.email);
        default:
          return 0;
      }
    });

  // Estadísticas
  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'Administrador').length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const sellerUsers = users.filter(u => u.role === 'Vendedor').length;

  return (
    <div data-bs-theme="dark" className="text-body min-vh-100" style={{ backgroundColor: 'transparent' }}>
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-primary-light mb-2">Panel de Administración</h1>
              <p className="text-muted lead">Gestiona todos los usuarios de la plataforma.</p>
            </div>

            {/* TODO EN UN SOLO RECUADRO */}
            <div className="card bg-primary-dark border-0 mb-4">
              <div className="card-body">
                
                {/* Sección de Búsqueda y Filtros */}
                <div className="mb-4">
                  <h5 className="text-primary-light mb-3">Buscar usuarios por nombre o email</h5>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control bg-dark border-secondary text-white"
                        placeholder="Nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-primary-light mb-2">Rol</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                      >
                        <option value="all">Todos</option>
                        <option value="Usuario">Usuario</option>
                        <option value="Administrador">Administrador</option>
                        <option value="Vendedor">Vendedor</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-primary-light mb-2">Estado</label>
                      <select
                        className="form-select bg-dark border-secondary text-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">Todos</option>
                        <option value="Active">Active</option>
                        <option value="Inactivo">Inactivo</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-primary-light mb-2">Ordenar</label>
                      <select 
                        className="form-select bg-dark border-secondary text-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="name">Nombre</option>
                        <option value="email">Email</option>
                        <option value="role">Rol</option>
                        <option value="status">Estado</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button 
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchTerm('');
                          setRoleFilter('all');
                          setStatusFilter('all');
                          setSortBy('name');
                        }}
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Separador */}
                <hr className="border-secondary my-4" />

                {/* Tabla de Usuarios - ESTILO TABLA TRADICIONAL */}
                <div className="table-responsive">
                  <table className="table table-dark table-borderless mb-0">
                    <thead>
                      <tr>
                        <th className="text-primary-light ps-3">NOMBRE</th>
                        <th className="text-primary-light">ROL</th>
                        <th className="text-primary-light">ESTADO</th>
                        <th className="text-primary-light text-center">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-bottom border-secondary">
                          <td className="ps-3">
                            <div>
                              <div className="text-primary-light fw-bold">{user.name}</div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </td>
                          <td>
                            {editingUser?.id === user.id ? (
                              <select
                                className="form-select form-select-sm bg-dark text-white"
                                value={editingUser.role}
                                onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                              >
                                <option value="Usuario">Usuario</option>
                                <option value="Administrador">Administrador</option>
                                <option value="Vendedor">Vendedor</option>
                              </select>
                            ) : (
                              <span className={`badge ${
                                user.role === 'Administrador' ? 'bg-warning text-dark' : 
                                user.role === 'Vendedor' ? 'bg-info text-dark' : 'bg-secondary'
                              }`}>
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td>
                            {editingUser?.id === user.id ? (
                              <select
                                className="form-select form-select-sm bg-dark text-white"
                                value={editingUser.status}
                                onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                              >
                                <option value="Active">Active</option>
                                <option value="Inactivo">Inactivo</option>
                              </select>
                            ) : (
                              <span className={`badge ${
                                user.status === 'Active' ? 'bg-success' : 'bg-danger'
                              }`}>
                                {user.status}
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {editingUser?.id === user.id ? (
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-success"
                                  onClick={handleSaveEdit}
                                >
                                  ✅
                                </button>
                                <button 
                                  className="btn btn-secondary"
                                  onClick={handleCancelEdit}
                                >
                                  ❌
                                </button>
                              </div>
                            ) : (
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary" 
                                  title="Editar"
                                  onClick={() => handleEditUser(user)}
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="btn btn-outline-danger" 
                                  title="Eliminar"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mensaje si no hay usuarios */}
                {filteredUsers.length === 0 && (
                  <div className="text-center text-muted py-4">
                    No se encontraron usuarios que coincidan con los filtros.
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="row">
              <div className="col-md-3 mb-3">
                <div className="card bg-primary-mid border-0 h-100">
                  <div className="card-body text-center py-4">
                    <h3 className="text-primary-light mb-2">{totalUsers}</h3>
                    <p className="text-muted mb-0 small">Total Usuarios</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-primary-mid border-0 h-100">
                  <div className="card-body text-center py-4">
                    <h3 className="text-primary-light mb-2">{adminUsers}</h3>
                    <p className="text-muted mb-0 small">Administradores</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-primary-mid border-0 h-100">
                  <div className="card-body text-center py-4">
                    <h3 className="text-primary-light mb-2">{activeUsers}</h3>
                    <p className="text-muted mb-0 small">Usuarios Activos</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card bg-primary-mid border-0 h-100">
                  <div className="card-body text-center py-4">
                    <h3 className="text-primary-light mb-2">{sellerUsers}</h3>
                    <p className="text-muted mb-0 small">Vendedores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
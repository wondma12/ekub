import React, { useState, useEffect } from 'react';
import UserTable from '../../components/users/UserTable';
import UserForm from '../../components/users/UserForm';
import UserDetails from '../../components/users/UserDetails';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { userService } from '../../services/userService';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formLoading, setFormLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      });

      setUsers(response.data?.users || []);
      setPagination(response.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userService.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleSubmitForm = async (formData) => {
    try {
      setFormLoading(true);
      setError(null);

      if (modalMode === 'create') {
        await userService.createUser(formData);
      } else {
        await userService.updateUser(selectedUser.id, formData);
      }

      setIsModalOpen(false);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (userId, status) => {
    try {
      await userService.updateUserStatus(userId, status);
      await fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage all users in the system</p>
        </div>
        <Button variant="primary" onClick={handleCreateUser}>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, email, or phone..."
              className="form-input"
            />
          </div>
          <div className="flex gap-3">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="form-input w-full sm:w-32"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="JUDGE">Judge</option>
              <option value="USER">User</option>
            </select>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-input w-full sm:w-32"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </form>
      </div>

      {/* User Table */}
      <UserTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onView={handleViewUser}
        onStatusChange={handleStatusChange}
        isLoading={loading}
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create New User' : 'Edit User'}
        size="lg"
        closeOnOverlayClick={!formLoading}
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsModalOpen(false)}
          isLoading={formLoading}
          isEdit={modalMode === 'edit'}
        />
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="User Details"
        size="lg"
      >
        <UserDetails
          user={selectedUser}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            handleEditUser(selectedUser);
          }}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Users;
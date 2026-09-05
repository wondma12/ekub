import React from 'react';
import Button from '../common/Button';

const UserDetails = ({ user, onEdit, onClose }) => {
  if (!user) return null;

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-red-100 text-red-800',
      JUDGE: 'bg-yellow-100 text-yellow-800',
      USER: 'bg-blue-100 text-blue-800',
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {user.full_name
              .split(' ')
              .map(word => word[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.full_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${getRoleBadge(user.role)}`}>
                {user.role}
              </span>
              <span className={`badge ${getStatusBadge(user.status)}`}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={onEdit}
        >
          Edit Profile
        </Button>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
            <p className="text-sm text-gray-900 mt-1">{user.email}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
            <p className="text-sm text-gray-900 mt-1">{user.phone || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</label>
            <p className="text-sm text-gray-900 mt-1">#{user.id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</label>
            <p className="text-sm text-gray-900 mt-1">{formatDate(user.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {user.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{user.stats.totalEkubs || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Ekubs</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{user.stats.totalDraws || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Draws</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{user.stats.totalWins || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Wins</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{user.stats.totalPayments || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Payments</p>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {user.recentActivity && user.recentActivity.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {user.recentActivity.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                <span className="text-gray-600">{activity.description}</span>
                <span className="text-gray-400 text-xs ml-auto">{formatDate(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close button for mobile */}
      <div className="md:hidden pt-4 border-t border-gray-200">
        <Button
          variant="light"
          fullWidth
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default UserDetails;
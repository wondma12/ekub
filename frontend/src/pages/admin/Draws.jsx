import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { drawService } from '../../services/drawService';

const Draws = () => {
  const navigate = useNavigate();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [editingDraw, setEditingDraw] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', draw_number: '', lucky_spin_count: '' });

  useEffect(() => {
    fetchDraws();
  }, [filters.status]);

  const fetchDraws = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await drawService.getAllDraws({});
      let filteredData = data || [];
      
      // Filter by status
      if (filters.status) {
        filteredData = filteredData.filter(d => d.status === filters.status);
      }

      if (filters.search.trim()) {
        const search = filters.search.trim().toLowerCase();
        filteredData = filteredData.filter((draw) =>
          (draw.title || '').toLowerCase().includes(search) ||
          String(draw.draw_number).includes(search) ||
          String(draw.ekub_id).includes(search)
        );
      }

      // Sort by date (newest first)
      filteredData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setDraws(filteredData);
    } catch (err) {
      setError(err.message || 'Failed to fetch draws');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      READY: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      DRAFT: '📝',
      READY: '✅',
      IN_PROGRESS: '🔄',
      COMPLETED: '🎉',
      CANCELLED: '❌',
    };
    return icons[status] || '📌';
  };

  const getActivityState = (draw) => {
    const isActive = draw.is_active !== false;
    return {
      label: isActive ? 'Active' : 'Deactivated',
      className: isActive ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-100 border-gray-200',
      icon: isActive ? (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateDraw = () => {
    navigate('/draws/new');
  };

  const handleViewDraw = (drawId) => {
    navigate(`/draws/${drawId}`);
  };

  const handleStartDraw = async (drawId) => {
    try {
      await drawService.startDraw(drawId);
      await fetchDraws();
    } catch (err) {
      setError(err.message || 'Failed to start draw');
    }
  };

  const handleCancelDraw = async (drawId) => {
    if (!window.confirm('Are you sure you want to cancel this draw?')) return;
    
    try {
      await drawService.cancelDraw(drawId);
      await fetchDraws();
    } catch (err) {
      setError(err.message || 'Failed to cancel draw');
    }
  };

  const openEdit = (draw) => {
    setEditingDraw(draw);
    setEditForm({
      title: draw.title || '',
      draw_number: draw.draw_number,
      lucky_spin_count: draw.lucky_spin_count,
    });
  };

  const handleUpdateDraw = async (event) => {
    event.preventDefault();
    try {
      await drawService.updateDraw(editingDraw.id, {
        title: editForm.title,
        draw_number: Number(editForm.draw_number),
        lucky_spin_count: Number(editForm.lucky_spin_count),
      });
      setEditingDraw(null);
      await fetchDraws();
    } catch (err) {
      setError(err.message || 'Failed to update draw');
    }
  };

  const handleDeleteDraw = async (draw) => {
    if (!window.confirm(`Delete ${draw.title || `Draw #${draw.draw_number}`}?`)) return;
    try {
      await drawService.deleteDraw(draw.id);
      await fetchDraws();
    } catch (err) {
      setError(err.message || 'Failed to delete draw');
    }
  };

  const handleToggleDraw = async (draw) => {
    const nextState = draw.is_active === false;
    const action = nextState ? 'activate' : 'deactivate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${draw.title || `Draw #${draw.draw_number}`}?`)) return;

    try {
      await drawService.setDrawActive(draw.id, nextState);
      await fetchDraws();
    } catch (err) {
      setError(err.message || 'Failed to update draw activity');
    }
  };

  const DrawCard = ({ draw }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon(draw.status)}</span>
            <h3 className="font-semibold text-gray-900">{draw.title || `Draw #${draw.draw_number}`}</h3>
            {(() => {
              const activity = getActivityState(draw);
              return (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${activity.className}`}
                  title={`${activity.label} draw`}
                  aria-label={`${activity.label} draw`}
                >
                  {activity.icon}
                  {activity.label}
                </span>
              );
            })()}
            <span className={`badge ${getStatusBadge(draw.status)}`}>
              {draw.status}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Draw Number</p>
              <p className="font-medium text-gray-700">#{draw.draw_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Winners</p>
              <p className="font-medium text-gray-700">{draw.total_winners || 0}</p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium text-gray-700">{formatDate(draw.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Created By</p>
              <p className="font-medium text-gray-700">{draw.creator?.full_name || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {(draw.status === 'DRAFT' || draw.status === 'READY') && (
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStartDraw(draw.id)}
            >
              Start
            </Button>
          )}
          {draw.status === 'IN_PROGRESS' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleViewDraw(draw.id)}
            >
              Continue
            </Button>
          )}
          {(draw.status === 'DRAFT' || draw.status === 'READY') && (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => handleCancelDraw(draw.id)}
            >
              Cancel
            </Button>
          )}
          {(draw.status === 'DRAFT' || draw.status === 'READY') && (
            <Button size="sm" variant="outline-secondary" onClick={() => openEdit(draw)}>
              Edit
            </Button>
          )}
          <Button size="sm" variant="outline-danger" onClick={() => handleDeleteDraw(draw)}>
            Delete
          </Button>
          <Button
            size="sm"
            variant={draw.is_active === false ? 'outline-success' : 'outline-secondary'}
            onClick={() => handleToggleDraw(draw)}
          >
            {draw.is_active === false ? 'Activate' : 'Deactivate'}
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => handleViewDraw(draw.id)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Draws</h1>
          <p className="text-sm text-gray-500">Manage all draws and spin wheels</p>
        </div>
        <Button variant="primary" onClick={handleCreateDraw}>
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Draw
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert type="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {editingDraw && (
        <form onSubmit={handleUpdateDraw} className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Edit Draw #{editingDraw.draw_number}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="form-input"
              value={editForm.title}
              onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
              placeholder="Draw title"
            />
            <input
              className="form-input"
              type="number"
              min="1"
              required
              value={editForm.draw_number}
              onChange={(event) => setEditForm({ ...editForm, draw_number: event.target.value })}
              placeholder="Draw number"
            />
            <input
              className="form-input"
              type="number"
              min="0"
              required
              value={editForm.lucky_spin_count}
              onChange={(event) => setEditForm({ ...editForm, lucky_spin_count: event.target.value })}
              placeholder="Lucky spins"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline-secondary" onClick={() => setEditingDraw(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search draws..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="form-input"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="form-input w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="READY">Ready</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={fetchDraws}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Draws List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mt-1"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : draws.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="text-6xl block mb-4">🎯</span>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No draws found</h3>
          <p className="text-gray-500 text-sm">Create your first draw to get started</p>
          <Button variant="primary" onClick={handleCreateDraw} className="mt-4">
            Create Draw
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {draws.map((draw) => (
            <DrawCard key={draw.id} draw={draw} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Draws;
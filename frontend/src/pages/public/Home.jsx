import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { drawService } from '../../services/drawService';

const statusStyles = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  READY: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusIcons = {
  DRAFT: '📝',
  READY: '✅',
  IN_PROGRESS: '🔄',
  COMPLETED: '🎉',
  CANCELLED: '❌',
};

const Home = () => {
  const { user } = useAuth();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const response = await drawService.getAllDraws({ page: 1, limit: 100 });
        setDraws(Array.isArray(response) ? response : response?.rows || []);
      } catch (requestError) {
        setError(requestError.message || 'Unable to load draws');
      } finally {
        setLoading(false);
      }
    };

    fetchDraws();
  }, []);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold">Welcome to Digital Ekub 🎯</h1>
          <p className="text-indigo-100 text-lg mt-2">
            View every draw, lucky user selection, and winner in one place.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {user ? (
              <Link to="/draws" className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50">
                Manage Draws
              </Link>
            ) : (
              <Link to="/login" className="px-6 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Draws</h2>
            <p className="text-sm text-gray-500 mt-1">Open a draw to view its lucky users and winners.</p>
          </div>
          <span className="text-sm text-gray-500">{draws.length} draws</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-600">{error}</div>
        ) : draws.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <span className="text-4xl block mb-3">📭</span>
            <p className="text-gray-500">No draws are available yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => (
              <Link
                key={draw.id}
                to={`/draws/${draw.id}/public`}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{statusIcons[draw.status] || '📌'}</span>
                      <h3 className="font-semibold text-gray-900">{draw.title || `Draw #${draw.draw_number}`}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>📅 {formatDate(draw.created_at)}</span>
                      <span>⭐ {draw.lucky_user_ids?.length || 0} lucky users</span>
                      <span>🏆 {draw.total_winners || 0} winners</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusStyles[draw.status] || 'bg-gray-100 text-gray-800'}`}>
                      {draw.status}
                    </span>
                    <span className="block text-sm text-indigo-600 font-medium mt-2">View Draw →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
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
    <div className="home-page">
      <header className="home-header">
        <Link to="/" className="home-brand" aria-label="Digital Ekub home">
          <span className="home-brand-mark">E</span>
          <span>Digital <strong>Ekub</strong></span>
        </Link>
        <div className="home-header-note"><span className="home-live-dot" /> Community draws, made transparent</div>
        {user ? (
          <Link to="/draws" className="home-header-link">Manage draws <span aria-hidden="true">↗</span></Link>
        ) : (
          <Link to="/login" className="home-header-link">Admin login <span aria-hidden="true">↗</span></Link>
        )}
      </header>

      <main>
        <section className="home-draws-section" id="draws">
          <div className="home-section-heading">
            <div>
              <p className="home-kicker"><span /> THE ARCHIVE</p>
              <h2>All draws</h2>
              <p>Open a draw to view its winners.</p>
            </div>
            <span className="home-count">{String(draws.length).padStart(2, '0')} / COLLECTION</span>
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
          <div className="home-draw-grid">
            {draws.map((draw) => (
              <Link
                key={draw.id}
                to={`/draws/${draw.id}/public`}
                className="home-draw-card"
              >
                <div className="home-draw-card-top">
                  <span className="home-draw-number">DRAW / {String(draw.draw_number || draw.id).padStart(2, '0')}</span>
                  <span className={`home-status home-status-${draw.status?.toLowerCase() || 'unknown'}`}><span>{statusIcons[draw.status] || '•'}</span>{draw.status}</span>
                </div>
                <h3>{draw.title || `Draw #${draw.draw_number}`}</h3>
                <div className="home-draw-meta">
                  <span><b>DATE</b>{formatDate(draw.created_at)}</span>
                  {/* <span><b>LUCKY</b>{draw.lucky_user_ids?.length || 0} people</span> */}
                  <span><b>WINNERS</b>{draw.total_winners || 0}</span>
                </div>
                <span className="home-draw-link">View draw <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        )}
      </section>
      </main>
    </div>
  );
};

export default Home;
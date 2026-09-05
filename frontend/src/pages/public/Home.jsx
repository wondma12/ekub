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

const StatIcon = ({ type }) => {
  if (type === 'draws') {
    return <span className="home-stat-icon home-stat-icon-teal" aria-hidden="true">◎</span>;
  }

  if (type === 'lucky') {
    return <span className="home-stat-icon home-stat-icon-coral" aria-hidden="true">✦</span>;
  }

  return <span className="home-stat-icon home-stat-icon-gold" aria-hidden="true">♛</span>;
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

  const luckyUsers = draws.reduce((total, draw) => total + (draw.lucky_user_ids?.length || 0), 0);
  const winners = draws.reduce((total, draw) => total + (draw.total_winners || 0), 0);

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
        <section className="home-hero">
          <div className="home-hero-copy">
            <p className="home-kicker"><span /> THE DRAW ROOM</p>
            <h1>Good fortune,<br /><em>made visible.</em></h1>
            <p className="home-hero-text">A clear, shared view of every  selection OF  winner. Step inside and follow the story of each draw.</p>
            <div className="home-hero-actions">
              <a href="#draws" className="home-primary-action">Explore the draws <span aria-hidden="true">↓</span></a>
              <span className="home-hero-caption">Open records · Live results</span>
            </div>
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <div className="home-sun" />
            <div className="home-ticket home-ticket-back"><span>EKUB</span></div>
            <div className="home-ticket home-ticket-front">
              <span className="home-ticket-label">NEXT MOMENT</span>
              <strong>YOUR<br />WINNER<br /><i>AWAITS</i></strong>
              <span className="home-ticket-star">✦</span>
            </div>
            <span className="home-art-note home-art-note-top">01 / OPEN</span>
            <span className="home-art-note home-art-note-bottom">SHARE THE JOY</span>
          </div>
        </section>

        <section className="home-stats" aria-label="Draw overview">
          <div><StatIcon type="draws" /><span><strong>{draws.length}</strong> published {draws.length === 1 ? 'draw' : 'draws'}</span></div>
          {/* <div><StatIcon type="lucky" /><span><strong>{luckyUsers}</strong> RANDOM {luckyUsers === 1 ? 'person' : 'people'}</span></div> */}
          <div><StatIcon type="winners" /><span><strong>{winners}</strong> {winners === 1 ? 'winner' : 'winners'} celebrated</span></div>
        </section>

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
import React, { useEffect, useState } from 'react';
import Alert from '../../components/common/Alert';
import { drawService } from '../../services/drawService';

const Settings = () => {
  const [draws, setDraws] = useState([]);
  const [selectedDrawId, setSelectedDrawId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDraws = async () => {
      try {
        const data = await drawService.getAllDraws({ limit: 100 });
        const availableDraws = data || [];
        setDraws(availableDraws);
        if (availableDraws.length > 0) {
          setSelectedDrawId(String(availableDraws[0].id));
        }
      } catch (requestError) {
        setError(requestError.message || 'Failed to load draws');
      } finally {
        setLoading(false);
      }
    };

    loadDraws();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Configure lucky numbers for each draw.</p>
      </div>

      {error && <Alert type="error" onDismiss={() => setError(null)}>{error}</Alert>}

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label htmlFor="settings-draw" className="block text-sm font-medium text-gray-700">Draw</label>
          <select
            id="settings-draw"
            value={selectedDrawId}
            onChange={(event) => setSelectedDrawId(event.target.value)}
            className="form-input mt-1"
          >
            {draws.map((draw) => (
              <option key={draw.id} value={draw.id}>
                {draw.title || `Draw #${draw.draw_number}`} ({draw.status})
              </option>
            ))}
          </select>
        </div>

      </section>
    </div>
  );
};

export default Settings;

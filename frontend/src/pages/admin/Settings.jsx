import React, { useEffect, useState } from 'react';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { drawService } from '../../services/drawService';

const Settings = () => {
  const [draws, setDraws] = useState([]);
  const [selectedDrawId, setSelectedDrawId] = useState('');
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [luckyNumbers, setLuckyNumbers] = useState([]);
  const [selectedLucky, setSelectedLucky] = useState([]);
  const [totalNumbers, setTotalNumbers] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  useEffect(() => {
    if (!selectedDrawId) return;

    const loadDrawStatus = async () => {
      try {
        setError(null);
        const data = await drawService.getDrawStatus(selectedDrawId);
        setSelectedDraw(data.draw);
        setLuckyNumbers(data.luckyNumbers || []);
        setSelectedLucky((data.luckyNumbers || []).map(Number));
        setTotalNumbers(data.totalNumbers || 0);
      } catch (requestError) {
        setError(requestError.message || 'Failed to load draw settings');
      }
    };

    loadDrawStatus();
  }, [selectedDrawId]);

  const toggleLuckyNumber = (number) => {
    setSelectedLucky((current) => {
      if (current.includes(number)) return current.filter((value) => value !== number);
      if (current.length >= 7) return current;
      return [...current, number];
    });
  };

  const handleSaveLuckyNumbers = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await drawService.setLuckyNumbers(selectedDrawId, selectedLucky);
      setLuckyNumbers(selectedLucky);
      setIsModalOpen(false);
    } catch (requestError) {
      setError(requestError.message || String(requestError));
    } finally {
      setIsSaving(false);
    }
  };

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

        {selectedDraw && luckyNumbers.length === 0 && (
          <div className="border-t border-gray-100 pt-5">
            <Button
              variant="warning"
              disabled={selectedDraw.status !== 'DRAFT'}
              onClick={() => setIsModalOpen(true)}
            >
              ⭐ Set Lucky Number
            </Button>
          </div>
        )}

      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="⭐ Select Lucky Numbers"
        size="lg"
        actions={(
          <>
            <Button variant="light" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSaveLuckyNumbers}
              disabled={selectedLucky.length === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : `Set ${selectedLucky.length} Lucky Numbers`}
            </Button>
          </>
        )}
      >
        <p className="text-sm text-gray-600 mb-4">Select up to 7 wheel numbers. They will be picked first.</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-80 overflow-y-auto">
          {Array.from({ length: totalNumbers }, (_, index) => index + 1).map((number) => {
            const isSelected = selectedLucky.includes(number);
            return (
              <button
                key={number}
                type="button"
                onClick={() => toggleLuckyNumber(number)}
                className={`rounded-lg border px-2 py-2 text-sm font-semibold transition-colors ${isSelected
                  ? 'border-yellow-400 bg-yellow-100 text-yellow-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-gray-500">Selected: {selectedLucky.length} / 7</p>
      </Modal>
    </div>
  );
};

export default Settings;

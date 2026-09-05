import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { drawService } from '../../services/drawService';

const CreateDraw = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ekub_id: '1',
    draw_number: '',
    title: '',
    lucky_spin_count: '7',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const draw = await drawService.createDraw({
        ekub_id: Number(form.ekub_id),
        draw_number: Number(form.draw_number),
        title: form.title.trim() || undefined,
        lucky_spin_count: Number(form.lucky_spin_count),
      });
      navigate(`/draws/${draw.id}`);
    } catch (requestError) {
      setError(requestError.message || String(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Home
        </button>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Create New Draw</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set up the draw, then choose lucky numbers and spin the wheel.
        </p>
      </div>

      {error && (
        <Alert type="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div>
          <label htmlFor="ekub_id" className="block text-sm font-medium text-gray-700">Ekub ID</label>
          <p className="mt-1 text-xs text-gray-500">The default Digital Ekub uses ID 1.</p>
          <input
            id="ekub_id"
            name="ekub_id"
            type="number"
            min="1"
            required
            value={form.ekub_id}
            onChange={handleChange}
            className="form-input mt-1"
          />
        </div>

        <div>
          <label htmlFor="draw_number" className="block text-sm font-medium text-gray-700">Draw number</label>
          <input
            id="draw_number"
            name="draw_number"
            type="number"
            min="1"
            required
            value={form.draw_number}
            onChange={handleChange}
            placeholder="For example, 1"
            className="form-input mt-1"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Optional draw title"
            className="form-input mt-1"
          />
        </div>

        <div>
          <label htmlFor="lucky_spin_count" className="block text-sm font-medium text-gray-700">Lucky spins</label>
          <input
            id="lucky_spin_count"
            name="lucky_spin_count"
            type="number"
            min="0"
            value={form.lucky_spin_count}
            onChange={handleChange}
            className="form-input mt-1"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline-secondary" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Draw'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateDraw;

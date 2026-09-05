import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import ekubService from '../../services/ekubService';

const Ekubs = () => {
  const [ekubs, setEkubs] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', contribution_amount: '' });

  const loadEkubs = async () => {
    try {
      setError(null);
      setEkubs(await ekubService.getEkubs());
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    loadEkubs();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);
      const payload = {
        name: form.name,
        description: form.description,
        contribution_amount: Number(form.contribution_amount),
      };
      if (editingId) {
        await ekubService.updateEkub(editingId, payload);
      } else {
        await ekubService.createEkub(payload);
      }
      closeForm();
      await loadEkubs();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm({ name: '', description: '', contribution_amount: '' });
  };

  const startEdit = (ekub) => {
    setEditingId(ekub.id);
    setForm({
      name: ekub.name,
      description: ekub.description || '',
      contribution_amount: ekub.contribution_amount,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (ekub) => {
    if (!window.confirm(`Delete ${ekub.name}?`)) return;
    try {
      setError(null);
      await ekubService.deleteEkub(ekub.id);
      await loadEkubs();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ekubs</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your rotating savings groups.</p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={() => { closeForm(); setIsFormOpen(true); }}>
            Create Ekub
          </Button>
          <Link
            to="/draws/new"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border-2 border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-50 transition-colors"
          >
            Create Draw
          </Link>
        </div>
      </div>

      {error && <Alert type="error" onDismiss={() => setError(null)}>{error}</Alert>}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Ekub' : 'Create Ekub'}</h2>
          <input name="name" required maxLength="150" value={form.name} onChange={handleChange} placeholder="Ekub name" className="form-input" />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows="3" className="form-input" />
          <input name="contribution_amount" required min="0" step="0.01" type="number" value={form.contribution_amount} onChange={handleChange} placeholder="Contribution amount" className="form-input" />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline-secondary" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Ekub'}</Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ekubs.map((ekub) => (
          <section key={ekub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Ekub #{ekub.id}</p>
                <h2 className="mt-2 text-xl font-bold text-gray-900">{ekub.name}</h2>
                <p className="mt-1 text-sm text-gray-500">{ekub.description || 'No description provided.'}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {ekub.status}
              </span>
            </div>
            <p className="mt-5 text-sm text-gray-500">Contribution</p>
            <p className="text-lg font-semibold text-gray-900">{Number(ekub.contribution_amount).toFixed(2)}</p>
            <div className="mt-5 flex gap-2">
              <Button size="sm" variant="outline-secondary" onClick={() => startEdit(ekub)}>Edit</Button>
              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(ekub)}>Delete</Button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Ekubs;

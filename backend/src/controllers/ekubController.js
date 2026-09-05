import { Ekub } from '../models/index.js';

export const getEkubs = async (req, res) => {
  try {
    const ekubs = await Ekub.findAll({
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, data: ekubs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createEkub = async (req, res) => {
  try {
    const { name, description, contribution_amount } = req.body;
    const ekub = await Ekub.create({
      name: name.trim(),
      description: description?.trim() || null,
      contribution_amount,
      status: 'ACTIVE',
      created_by: req.user.id,
    });

    res.status(201).json({ success: true, data: ekub });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateEkub = async (req, res) => {
  try {
    const ekub = await Ekub.findByPk(req.params.ekubId);
    if (!ekub) return res.status(404).json({ success: false, error: 'Ekub not found' });

    const { name, description, contribution_amount, status } = req.body;
    await ekub.update({
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(contribution_amount !== undefined && { contribution_amount }),
      ...(status !== undefined && { status }),
    });

    res.json({ success: true, data: ekub });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteEkub = async (req, res) => {
  try {
    const ekub = await Ekub.findByPk(req.params.ekubId);
    if (!ekub) return res.status(404).json({ success: false, error: 'Ekub not found' });
    const dependentCount = await Promise.all([
      ekub.countDraws(),
      ekub.countMembers(),
      ekub.countCycles(),
    ]);
    if (dependentCount.some(Boolean)) {
      return res.status(409).json({ success: false, error: 'Ekub cannot be deleted while it has draws, members, or cycles' });
    }
    await ekub.destroy();
    res.json({ success: true, data: { id: req.params.ekubId } });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
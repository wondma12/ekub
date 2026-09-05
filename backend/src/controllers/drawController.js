import drawService from '../services/drawService.js';

export const createDraw = async (req, res) => {
  try {
    const draw = await drawService.createDraw({
      ...req.body,
      created_by: req.user.id,
    });
    res.status(201).json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const setLuckyNumbers = async (req, res) => {
  try {
    const { drawId } = req.params;
    const { luckyNumbers } = req.body;
    
    const draw = await drawService.setLuckyNumbers(drawId, luckyNumbers, req.user.id);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const startDraw = async (req, res) => {
  try {
    const { drawId } = req.params;
    const draw = await drawService.startDraw(drawId);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const spin = async (req, res) => {
  try {
    const { drawId } = req.params;
    const result = await drawService.spin(drawId);
    res.json({ success: true, data: result });
  } catch (error) {
    const status = error.message === 'Draw is not in progress' ? 409 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};

export const getDrawStatus = async (req, res) => {
  try {
    const { drawId } = req.params;
    const status = await drawService.getDrawStatus(drawId);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDrawsByEkub = async (req, res) => {
  try {
    const { ekubId } = req.params;
    const draws = await drawService.getDrawsByEkub(ekubId);
    res.json({ success: true, data: draws });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDrawById = async (req, res) => {
  try {
    const { drawId } = req.params;
    const draw = await drawService.getDrawById(drawId);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const cancelDraw = async (req, res) => {
  try {
    const { drawId } = req.params;
    const draw = await drawService.cancelDraw(drawId);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDrawResults = async (req, res) => {
  try {
    const { drawId } = req.params;
    const results = await drawService.getDrawResults(drawId);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const resetDraw = async (req, res) => {
  try {
    const { drawId } = req.params;
    const draw = await drawService.resetDraw(drawId);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAvailableUsers = async (req, res) => {
  try {
    const { drawId } = req.params;
    const users = await drawService.getAvailableUsers(drawId);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllDraws = async (req, res) => {
  try {
    const draws = await drawService.getAllDraws();
    res.json({ success: true, data: draws });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDraw = async (req, res) => {
  try {
    const draw = await drawService.updateDraw(req.params.drawId, req.body);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteDraw = async (req, res) => {
  try {
    const result = await drawService.deleteDraw(req.params.drawId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const setDrawActive = async (req, res) => {
  try {
    const draw = await drawService.setDrawActive(req.params.drawId, req.body.is_active);
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
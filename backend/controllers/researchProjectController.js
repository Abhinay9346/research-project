const ResearchProject = require('../models/ResearchProject');
const NotificationService = require('../services/NotificationService');
const { buildRoleWhereClause } = require('../utils/roleFilter');

exports.getAll = async (req, res, next) => {
  try {
    const { whereClause, whereValues } = await buildRoleWhereClause(req.user);
    const data = await ResearchProject.findAll('created_at DESC', whereClause, whereValues);
    res.status(200).json({ success: true, message: 'Records fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    const data = await ResearchProject.findById(id);
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });

    res.status(200).json({ success: true, message: 'Record fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body cannot be empty' });
    }

    const { scholar_id } = req.body;
    if (!scholar_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: scholar_id' 
      });
    }

    const data = await ResearchProject.create(req.body);

    // Notify Guide
    if (req.user && (req.user.guideId || req.user.guideName)) {
      let guideId = req.user.guideId;
      if (!guideId || guideId.length !== 36) { // fallback to name lookup
         guideId = await NotificationService.getUserIdByName(req.user.guideName);
      }
      if (guideId && guideId !== 'unknown') {
        await NotificationService.notify({
          recipient_user_id: guideId,
          title: 'New Research Project Added',
          message: `${req.user.userName || scholar_id} added a research project.`,
          type: 'info',
          module: 'research_projects',
          record_id: data.insertId || data.id
        });
      }
    }

    res.status(201).json({ success: true, message: 'Record created successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body cannot be empty' });
    }

    const data = await ResearchProject.update(id, req.body);

    if (req.user && (req.user.guideId || req.user.guideName)) {
      let guideId = req.user.guideId;
      if (!guideId || guideId.length !== 36) { // fallback to name lookup
         guideId = await NotificationService.getUserIdByName(req.user.guideName);
      }
      if (guideId && guideId !== 'unknown') {
        await NotificationService.notify({
          recipient_user_id: guideId,
          title: 'Research Project Updated',
          message: `${req.user.userName} updated their research project.`,
          type: 'info',
          module: 'research_projects',
          record_id: id
        });
      }
    }

    res.status(200).json({ success: true, message: 'Record updated successfully', data });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    await ResearchProject.delete(id);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

const GuideExplanation = require('../models/GuideExplanation');
const NotificationService = require('../services/NotificationService');
const { buildRoleWhereClause } = require('../utils/roleFilter');

exports.getAll = async (req, res, next) => {
  try {
    const { whereClause, whereValues } = await buildRoleWhereClause(req.user);
    const data = await GuideExplanation.findAll('created_at DESC', whereClause, whereValues);
    res.status(200).json({ success: true, message: 'Records fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    const data = await GuideExplanation.findById(id);
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

    const { scholar_id, reason_for_delay, challenges_faced, current_progress } = req.body;
    if (!scholar_id || !reason_for_delay || !challenges_faced || !current_progress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: scholar_id, reason_for_delay, challenges_faced, current_progress' 
      });
    }

    const data = await GuideExplanation.create(req.body);

    const chairmanIds = await NotificationService.getUsersByRole('chairman');
    if (chairmanIds.length > 0) {
      await NotificationService.notifyMultiple({
        recipient_user_ids: chairmanIds,
        title: 'New Guide Explanation',
        message: `${req.user.userName || req.body.guide_name || 'A guide'} submitted an explanation for scholar ${scholar_id}.`,
        type: 'warning',
        module: 'guide_explanations',
        record_id: data.insertId || data.id
      });
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

    const data = await GuideExplanation.update(id, req.body);
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

    await GuideExplanation.delete(id);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

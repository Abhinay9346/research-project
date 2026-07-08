const WeeklyLog = require('../models/WeeklyLog');
const NotificationService = require('../services/NotificationService');
const { buildRoleWhereClause } = require('../utils/roleFilter');

exports.getAll = async (req, res, next) => {
  try {
    const { whereClause, whereValues } = await buildRoleWhereClause(req.user);
    const data = await WeeklyLog.findAll('created_at DESC', whereClause, whereValues);
    res.status(200).json({ success: true, message: 'Records fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    const data = await WeeklyLog.findById(id);
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

    const { scholar_id, scholar_name, week_date, research_work } = req.body;
    if (!scholar_id || !scholar_name || !week_date || !research_work) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: scholar_id, scholar_name, week_date, research_work' 
      });
    }

    const data = await WeeklyLog.create(req.body);

    // Notify Guide
    let guideId = req.body.guide_id;
    if (guideId && guideId.length !== 36) { // Not a UUID, assume name
       guideId = await NotificationService.getUserIdByName(guideId);
    }
    if (guideId && guideId !== 'unknown') {
      await NotificationService.notify({
        recipient_user_id: guideId,
        title: 'New Weekly Log',
        message: `${scholar_name} submitted a weekly log for ${week_date}.`,
        type: 'info',
        module: 'weekly_logs',
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

    const data = await WeeklyLog.update(id, req.body);

    // Notify Scholar if status changed
    if (req.body.approval_status) {
      const log = await WeeklyLog.findById(id);
      if (log) {
        const scholarId = await NotificationService.getUserIdByName(log.scholar_name);
        if (scholarId) {
           await NotificationService.notify({
             recipient_user_id: scholarId,
             title: 'Weekly Log Updated',
             message: `Your weekly log for ${log.week_date} was ${req.body.approval_status}.`,
             type: req.body.approval_status === 'approved' ? 'success' : 'warning',
             module: 'weekly_logs',
             record_id: id
           });
        }
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

    await WeeklyLog.delete(id);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

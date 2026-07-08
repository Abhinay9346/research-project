const CommitteeMeeting = require('../models/CommitteeMeeting');
const NotificationService = require('../services/NotificationService');
const { buildRoleWhereClause } = require('../utils/roleFilter');

exports.getAll = async (req, res, next) => {
  try {
    const { whereClause, whereValues } = await buildRoleWhereClause(req.user);
    const data = await CommitteeMeeting.findAll('created_at DESC', whereClause, whereValues);
    res.status(200).json({ success: true, message: 'Records fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    const data = await CommitteeMeeting.findById(id);
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

    const { scholar_id, scholar_name, title, meeting_date, agenda } = req.body;
    if (!scholar_id || !scholar_name || !title || !meeting_date || !agenda) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: scholar_id, scholar_name, title, meeting_date, agenda' 
      });
    }

    const data = await CommitteeMeeting.create(req.body);

    // Notify Scholar
    const scholarId = await NotificationService.getUserIdByName(scholar_name);
    if (scholarId) {
      await NotificationService.notify({
        recipient_user_id: scholarId,
        title: 'New Committee Meeting Scheduled',
        message: `A committee meeting "${title}" has been scheduled for ${meeting_date}.`,
        type: 'info',
        module: 'committee_meetings',
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

    const data = await CommitteeMeeting.update(id, req.body);

    // Notify Scholar on status change
    if (req.body.status) {
      const meeting = await CommitteeMeeting.findById(id);
      if (meeting) {
        const scholarId = await NotificationService.getUserIdByName(meeting.scholar_name);
        if (scholarId) {
          await NotificationService.notify({
            recipient_user_id: scholarId,
            title: 'Committee Meeting Updated',
            message: `Your committee meeting "${meeting.title}" was marked as ${req.body.status}.`,
            type: req.body.status === 'completed' ? 'success' : 'info',
            module: 'committee_meetings',
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

    await CommitteeMeeting.delete(id);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

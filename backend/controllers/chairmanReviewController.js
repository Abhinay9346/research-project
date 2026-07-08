const ChairmanReview = require('../models/ChairmanReview');
const NotificationService = require('../services/NotificationService');
const { buildRoleWhereClause } = require('../utils/roleFilter');

exports.getAll = async (req, res, next) => {
  try {
    const { whereClause, whereValues } = await buildRoleWhereClause(req.user);
    const data = await ChairmanReview.findAll('created_at DESC', whereClause, whereValues);
    res.status(200).json({ success: true, message: 'Records fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    const data = await ChairmanReview.findById(id);
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

    const { scholar_id, observation, comments, recommendations, required_actions } = req.body;
    if (!scholar_id || !observation || !comments || !recommendations || !required_actions) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: scholar_id, observation, comments, recommendations, required_actions' 
      });
    }

    const data = await ChairmanReview.create(req.body);

    const scholarUserId = await NotificationService.getUserIdByScholarId(scholar_id);
    if (scholarUserId) {
      await NotificationService.notify({
        recipient_user_id: scholarUserId,
        title: 'New Chairman Review',
        message: `The Chairman has submitted a new review for your progress.`,
        type: 'info',
        module: 'chairman_reviews',
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

    const data = await ChairmanReview.update(id, req.body);

    const review = await ChairmanReview.findById(id);
    if (review) {
      const scholarUserId = await NotificationService.getUserIdByScholarId(review.scholar_id);
      if (scholarUserId) {
        await NotificationService.notify({
          recipient_user_id: scholarUserId,
          title: 'Chairman Review Updated',
          message: `The Chairman has updated the review for your progress.`,
          type: 'info',
          module: 'chairman_reviews',
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

    await ChairmanReview.delete(id);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

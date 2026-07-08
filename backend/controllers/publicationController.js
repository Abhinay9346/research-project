const Publication = require('../models/Publication');
const NotificationService = require('../services/NotificationService');
const { buildRoleWhereClause } = require('../utils/roleFilter');

exports.getAll = async (req, res, next) => {
  try {
    const { whereClause, whereValues } = await buildRoleWhereClause(req.user);
    const data = await Publication.findAll('created_at DESC', whereClause, whereValues);
    res.status(200).json({ success: true, message: 'Records fetched successfully', data });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID parameter is required' });

    const data = await Publication.findById(id);
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

    const { scholar_id, scholar_name, title, journal } = req.body;
    if (!scholar_id || !scholar_name || !title || !journal) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: scholar_id, scholar_name, title, journal' 
      });
    }

    const data = await Publication.create(req.body);

    // Notify Guide (if applicable) and Admins
    if (req.user && (req.user.guideId || req.user.guideName)) {
      let guideId = req.user.guideId;
      if (!guideId || guideId.length !== 36) { // fallback to name lookup
         guideId = await NotificationService.getUserIdByName(req.user.guideName);
      }
      if (guideId && guideId !== 'unknown') {
        await NotificationService.notify({
          recipient_user_id: guideId,
          title: 'New Publication Submitted',
          message: `${scholar_name} submitted a new publication: ${title}`,
          type: 'info',
          module: 'publications',
          record_id: data.insertId || data.id
        });
      }
    }
    const adminIds = await NotificationService.getUsersByRole('admin');
    if (adminIds.length > 0) {
      await NotificationService.notifyMultiple({
        recipient_user_ids: adminIds,
        title: 'New Publication Submitted',
        message: `${scholar_name} submitted a new publication: ${title}`,
        type: 'info',
        module: 'publications',
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

    const data = await Publication.update(id, req.body);

    // Notify Scholar on significant updates
    if (req.body.status || req.body.verified !== undefined) {
      const pub = await Publication.findById(id);
      if (pub) {
        const scholarId = await NotificationService.getUserIdByName(pub.scholar_name);
        if (scholarId) {
          const updateMsg = req.body.verified ? 'verified' : `marked as ${req.body.status}`;
          await NotificationService.notify({
            recipient_user_id: scholarId,
            title: 'Publication Updated',
            message: `Your publication "${pub.title}" was ${updateMsg}.`,
            type: req.body.verified ? 'success' : 'info',
            module: 'publications',
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

    await Publication.delete(id);
    res.status(200).json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    next(error);
  }
};

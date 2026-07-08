const db = require('../config/db');
const NotificationService = require('../services/NotificationService');

const normalizeDepartment = (dept) => {
  if (!dept) return null;
  const d = dept.trim().toLowerCase();
  if (d === 'cse' || d === 'computer science' || d === 'cs') return 'Computer Science';
  if (d === 'ece' || d === 'electronics') return 'Electronics';
  if (d === 'ee' || d === 'electrical') return 'Electrical';
  if (d === 'me' || d === 'mechanical') return 'Mechanical';
  if (d === 'ce' || d === 'civil') return 'Civil';
  if (d === 'che' || d === 'chemical') return 'Chemical';
  if (d === 'ai' || d === 'artificial intelligence') return 'Artificial Intelligence';
  
  return dept.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM users';
    let queryParams = [];

    if (role) {
      query += ' WHERE role = ?';
      queryParams.push(role);
    }

    if (req.user?.role === 'scholar') {
      query += (queryParams.length > 0 ? ' AND ' : ' WHERE ') + 'scholar_id = ?';
      queryParams.push(req.user.scholarId || null);
    } else if (req.user?.role === 'guide') {
      // Guide can see themselves OR their scholars
      query += (queryParams.length > 0 ? ' AND ' : ' WHERE ') + '(full_name = ? OR guide_id = ? OR guide_name = ?)';
      queryParams.push(req.user.userName || null, req.user.id || null, req.user.userName || null);
    }

    const [rows] = await db.execute(query, queryParams);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    let {
      full_name,
      email,
      role,
      department,
      scholar_id,
      guide_id,
      research_domain
    } = req.body;

    department = normalizeDepartment(department);

    if (!email || !full_name || !role) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const password = email;

    // Resolve guide_name from guide_id securely
    let resolved_guide_name = null;
    if (guide_id && role === 'scholar') {
      const [guideRows] = await db.execute('SELECT full_name, role FROM users WHERE id = ?', [guide_id]);
      if (guideRows.length > 0) {
        if (guideRows[0].role !== 'guide') {
          return res.status(400).json({ success: false, message: 'Assigned user is not a guide' });
        }
        resolved_guide_name = guideRows[0].full_name;
      } else {
        guide_id = null; // invalid guide_id
      }
    } else {
      guide_id = null; // only scholars get guides
    }

    const [result] = await db.execute(
      `INSERT INTO users 
       (full_name, email, password, role, department, scholar_id, guide_id, guide_name, research_domain) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, password, role, department || null, scholar_id || null, guide_id || null, resolved_guide_name, research_domain || null]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result.insertId,
        full_name,
        email,
        role,
        department,
        scholar_id,
        guide_id,
        guide_name: resolved_guide_name,
        research_domain
      }
    });

    // Notify Admins
    const adminIds = await NotificationService.getUsersByRole('admin');
    if (adminIds.length > 0) {
      await NotificationService.notifyMultiple({
        recipient_user_ids: adminIds,
        title: 'New User Created',
        message: `Admin ${req.user.userName || ''} created a new ${role} account for ${full_name}.`,
        type: 'info',
        module: 'users',
        record_id: result.insertId || result.id
      });
    }

  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    let { full_name, email, role, department, guide_id, status } = req.body;

    if (department !== undefined) {
      department = normalizeDepartment(department);
    }
    
    // If they pass guide_id (for assigning a guide), resolve guide_name
    let resolved_guide_name = undefined;
    if (guide_id !== undefined) {
      if (guide_id && role === 'scholar') { // wait, role might not be passed or could be existing role
        const [guideRows] = await db.execute('SELECT full_name, role FROM users WHERE id = ?', [guide_id]);
        if (guideRows.length > 0) {
          if (guideRows[0].role !== 'guide') {
            return res.status(400).json({ success: false, message: 'Assigned user is not a guide' });
          }
          resolved_guide_name = guideRows[0].full_name;
        } else {
          guide_id = null;
          resolved_guide_name = null;
        }
      } else if (!guide_id) {
         guide_id = null;
         resolved_guide_name = null;
      }
    }
    
    // Build dynamic update
    let updateFields = [];
    let updateValues = [];
    if (full_name !== undefined) { updateFields.push('full_name = ?'); updateValues.push(full_name || null); }
    if (email !== undefined) { updateFields.push('email = ?'); updateValues.push(email || null); }
    if (role !== undefined) { updateFields.push('role = ?'); updateValues.push(role || null); }
    if (department !== undefined) { updateFields.push('department = ?'); updateValues.push(department || null); }
    if (status !== undefined) { updateFields.push('status = ?'); updateValues.push(status || null); }
    if (guide_id !== undefined) {
       updateFields.push('guide_id = ?'); updateValues.push(guide_id);
       updateFields.push('guide_name = ?'); updateValues.push(resolved_guide_name);
    }
    
    if (updateFields.length > 0) {
      updateValues.push(id || null);
      await db.execute(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ success: true, message: 'User deleted successfully' });

    // Notify Admins
    const adminIds = await NotificationService.getUsersByRole('admin');
    if (adminIds.length > 0) {
      await NotificationService.notifyMultiple({
        recipient_user_ids: adminIds,
        title: 'User Deleted',
        message: `Admin ${req.user.userName || ''} deleted user account (ID: ${id}).`,
        type: 'warning',
        module: 'users',
        record_id: id
      });
    }

  } catch (err) {
    next(err);
  }
};

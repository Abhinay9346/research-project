const db = require('../config/db');

exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    let query = 'SELECT * FROM users';
    let queryParams = [];

    if (role) {
      query += ' WHERE role = ?';
      queryParams.push(role);
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

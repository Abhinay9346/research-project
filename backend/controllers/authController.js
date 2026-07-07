const db = require('../config/db');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = rows[0];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        scholar_id: user.scholar_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        guide_name: user.guide_name,
        research_domain: user.research_domain,
      }
    });
  } catch (error) {
    next(error);
  }
};

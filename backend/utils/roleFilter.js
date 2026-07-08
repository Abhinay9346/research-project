const db = require('../config/db');

exports.buildRoleWhereClause = async (user) => {
  if (!user) return { whereClause: '', whereValues: [] };
  
  if (user.role === 'scholar') {
    return { whereClause: 'scholar_id = ?', whereValues: [user.scholarId] };
  } else if (user.role === 'guide') {
    const [scholars] = await db.query('SELECT scholar_id FROM users WHERE guide_name = ? AND role = "scholar"', [user.userName]);
    const scholarIds = scholars.map(s => s.scholar_id).filter(Boolean);
    if (scholarIds.length > 0) {
      return { 
        whereClause: `scholar_id IN (${scholarIds.map(() => '?').join(',')})`, 
        whereValues: scholarIds 
      };
    } else {
      return { whereClause: '1 = 0', whereValues: [] };
    }
  }
  
  // admin, chairman, committee see everything
  return { whereClause: '', whereValues: [] };
};

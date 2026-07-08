module.exports = (req, res, next) => {
  const role = req.headers['x-user-role'];
  const scholarId = req.headers['x-scholar-id'];
  const guideName = req.headers['x-guide-name'];
  const guideId = req.headers['x-guide-id'];
  const userName = req.headers['x-user-name'];
  const userId = req.headers['x-user-id'];
  
  if (role) {
    req.user = { id: userId, role, scholarId, guideName, guideId, userName };
  }
  next();
};

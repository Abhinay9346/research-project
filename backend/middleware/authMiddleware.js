module.exports = (req, res, next) => {
  const role = req.headers['x-user-role'];
  const scholarId = req.headers['x-scholar-id'];
  const guideName = req.headers['x-guide-name'];
  
  if (role) {
    req.user = { role, scholarId, guideName };
  }
  next();
};

const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: "Login to continue" });
};

module.exports = { auth };

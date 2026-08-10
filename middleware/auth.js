const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.locals.currentUser = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user || null;
    res.locals.currentUser = user || null;
    next();
  } catch {
    res.locals.currentUser = null;
    next();
  }
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}

module.exports = { optionalAuth, requireAuth };

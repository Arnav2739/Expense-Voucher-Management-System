/**
 * Role-based access control middleware
 * Validates whether the authenticated user has one of the required roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};

/**
 * Authentication and Role-Based Access Control (RBAC) Middleware (Exp 7 & 8)
 */

const authenticateSession = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // Fallback for development demo session if no session set
  const demoSession = {
    id: 'USR-001',
    name: 'Dr. Robert Warden',
    email: 'warden@aurahostel.com',
    role: 'Warden',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  };

  req.session.user = demoSession;
  req.user = demoSession;
  return next();
};

/**
 * Require specific user role middleware (Admin, Warden, Student)
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}].`
      });
    }

    next();
  };
};

module.exports = {
  authenticateSession,
  requireRole
};

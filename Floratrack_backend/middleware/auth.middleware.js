const FORBIDDEN_RESPONSE = {
  success: false,
  data: null,
  error: {
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action.',
    details: {}
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json(FORBIDDEN_RESPONSE);
    }

    req.userRole = role;
    next();
  };
};

// Allows admin/manager roles OR a regular user updating their own record.
// Self-update is detected when x-user-id header matches the :id route param.
const authorizeSelfOrRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.headers['x-user-role'];
    const requestingUserId = req.headers['x-user-id'];
    const targetId = req.params.id;

    if (role && allowedRoles.includes(role)) {
      req.userRole = role;
      return next();
    }

    if (role === 'user' && requestingUserId && requestingUserId === targetId) {
      req.userRole = role;
      return next();
    }

    return res.status(403).json(FORBIDDEN_RESPONSE);
  };
};

module.exports = { authorize, authorizeSelfOrRoles };

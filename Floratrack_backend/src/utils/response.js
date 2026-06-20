const sendSuccess = (res, data, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

const sendError = (res, status, code, message, details = {}) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

const parseId = (raw) => {
  const id = parseInt(raw, 10);
  return Number.isNaN(id) ? null : id;
};

module.exports = { sendSuccess, sendError, parseId };

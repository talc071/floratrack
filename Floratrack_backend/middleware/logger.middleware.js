const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const query = Object.keys(req.query).length ? ` | query: ${JSON.stringify(req.query)}` : '';
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)${query}`);
  });

  next();
};

module.exports = loggerMiddleware;

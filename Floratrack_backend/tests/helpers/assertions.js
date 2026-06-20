const assertSuccessShape = (body) => {
  if (body.success !== true) throw new Error('Expected success: true');
  if (body.data === undefined) throw new Error('Expected data field');
  if (body.error !== null) throw new Error('Expected error: null');
};

const assertErrorShape = (body) => {
  if (body.success !== false) throw new Error('Expected success: false');
  if (body.data !== null) throw new Error('Expected data: null');
  if (!body.error || typeof body.error !== 'object') throw new Error('Expected error object');
  if (typeof body.error.code !== 'string') throw new Error('Expected error.code string');
  if (typeof body.error.message !== 'string') throw new Error('Expected error.message string');
  if (body.error.details === undefined) throw new Error('Expected error.details field');
};

module.exports = { assertSuccessShape, assertErrorShape };

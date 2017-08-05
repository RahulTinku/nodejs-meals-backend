const enableCors = (req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
};

module.exports = {
  enableCors,
};

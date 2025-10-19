const jwt = require('jsonwebtoken');
require('dotenv').config();

function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader); // 👈 Thêm dòng này

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized - No token' });
  }

  const token = authHeader.split(' ')[1];
  console.log("Token:", token); // 👈 In token ra xem có giá trị không

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken); // 👈 Xem nội dung
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}


module.exports = isAuthenticated;

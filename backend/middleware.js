const jwt = require("jsonwebtoken"); // "Import JWT so we can verify tokens"
require("dotenv").config(); // "Load environment variables"

const authMiddleware = (req, res, next) => {
  // "Get the Authorization header from the request"
  const authHeader = req.headers.authorization;

  // "Check if token exists"
  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided",
    });
  }

  // "Split 'Bearer tokenhere' into ['Bearer', 'tokenhere']"
  const tokenParts = authHeader.split(" ");
  const token = tokenParts[1];

  // "Check if token part exists"
  if (!token) {
    return res.status(401).json({
      message: "Access denied. Invalid token format",
    });
  }

  try {
    // "Verify token using JWT secret"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // "Attach decoded user data to request"
    req.user = decoded;

    // "Move to the next function/route"
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
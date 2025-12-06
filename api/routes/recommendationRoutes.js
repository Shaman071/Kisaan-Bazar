const express = require("express");
const { getRecommendations, getPriceSuggestion } = require("../controllers/recommendationController");
const { verifyToken } = require("../utils/authMiddleware");

// Note: Recommendations can be public or personalized
const optionalAuth = (req, res, next) => {
    // If token exists, verify it, else valid but no user info
    // Simple approach: Use existing check logic but don't error
    // For now we will rely on verifyToken which might error if no header.
    // Let's create a custom middleware inline or just skip auth for public parts and use req.user only if present.
    // Actually our verifyToken throws 401. We need a loose middleware.

    // Quick Fix: Use verifyToken for personalized, but for public endpoint we handle it inside?
    // Let's just make /recommendations public but it checks 'verifyToken' optionally?
    // We will just expose it as public for MVP and if client sends header, good. However, standard verifyToken halts.
    // We'll skip complex middleware changes and just make TWO routes or use a simple middleware here.

    next();
};

const router = express.Router();

// Public (can be enhanced with token on frontend but we won't force it)
// We need a middleware to decode token IF present, but NOT fail if missing.
const decodeUserIfExists = require("../utils/authMiddleware").verifyTokenOptional || ((req, res, next) => {
    // Basic placeholder in case we don't implement the optional one yet
    // The controller logic checks 'if (req.user)'
    // We will need to implement this "Soft Auth" or just rely on public vs private
    // For now, let's just leave it open. The controller logic is checking req.user. 
    // BUT req.user won't be set without middleware. 
    // We'll update index.js to use the 'verifyToken' only on routes that need it.
    next();
});

// We need to actually Import the real verifyToken to see if we can adapt it.
// Assuming we can't easily change authMiddleware right now.
// We will just use the route without middleware for recommendations and let it be "Public/Popular" 
// UNLESS I add the optional middleware.
// Let's add a "softVerify" middleware here for now.
const jwt = require("jsonwebtoken");

const softVerify = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { _id: decoded.id }; // Minimal user obj
        } catch (error) {
            // Invalid token, just ignore and proceed as guest
        }
    }
    next();
};

router.get("/", softVerify, getRecommendations);
router.get("/price-suggestion", getPriceSuggestion);

module.exports = router;

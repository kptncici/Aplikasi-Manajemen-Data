// routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Contoh endpoint
router.get('/', (req, res) => {
  res.json({ message: 'User API is working!' });
});

module.exports = router;

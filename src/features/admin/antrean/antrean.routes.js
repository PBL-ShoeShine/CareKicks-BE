const express = require('express');
const router = express.Router();

// TODO: Implement antrean routes

router.get('/', (req, res) => {
  res.json({ message: 'Antrean routes - coming soon' });
});

module.exports = router;

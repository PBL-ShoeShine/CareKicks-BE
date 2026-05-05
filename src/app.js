require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.json());

app.use('/api/v1', require('./routes'));

app.listen(process.env.PORT, () => {
  console.log(`Server jalan di http://localhost:${process.env.PORT}`);
});
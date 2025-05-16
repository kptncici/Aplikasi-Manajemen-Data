const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes'); // sesuai nama file

app.use(express.json());
app.use('/api/users', userRoutes);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

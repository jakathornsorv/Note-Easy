const express = require('express');
const cors = require('cors'); 
const app = express();
const noteRoutes = require('./routes/noteRoutes');
const userRoutes = require('./routes/userRoutes')

app.use(express.json());
app.use(cors());

app.use('/api', noteRoutes);
app.use('/api', userRoutes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});




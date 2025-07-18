const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;
require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const waitlistRoutes = require('./routes/waitlist');

// Mount routes
app.use('/api', authRoutes);
app.use('/api/waitlist', waitlistRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; 
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/events');
const participatingEventRoutes = require('./routes/participatingEvent');
const participationRoutes = require('./routes/participation');

const app = express();

connectDB();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participating-events', participatingEventRoutes);
app.use('/api/participations', participationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

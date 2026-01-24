const express = require('express');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(express.json());

// Routes
app.use('/user', authRoutes);
app.use('/user', userRoutes);

module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

// routes import
const contractRoutes = require( './routes/contract');
const jobRoutes = require( './routes/job');
const profileRoutes = require( './routes/profile');
const adminRoutes = require( './routes/admin');

app.use('/contracts', contractRoutes);
app.use('/jobs', jobRoutes);
app.use('/balances', profileRoutes);
app.use('/admin', adminRoutes);

module.exports = app;

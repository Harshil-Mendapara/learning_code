const express = require('express');
const app = express();

const userRoutes = require('./user.routes')
const testRoutes = require('./test')

app.use(userRoutes);
app.use(testRoutes);

module.exports = app
const express = require('express');
const app = express();

require('dotenv').config();

const MONGODB_URL = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.trguitc.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;
/////////////////////////////////////////
// Input formats
const bodyParser = require('body-parser');
app.use(bodyParser.json());

/////////////////////////////////////////
// Initial Endpoints
// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

/////////////////////////////////////////
// Endpoints
const todoRoutes = require('./routes/todo');
const authRoutes = require('./routes/auth');

app.use('/todo', todoRoutes);
app.use(authRoutes);

/////////////////////////////////////////
// MongoDB Coonection and Server
const mongoose = require('mongoose');
mongoose
  .connect(MONGODB_URL)
  .then(client => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log('connection error: ', err);
  });

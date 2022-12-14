const express =require('express');
const colors = require('colors')
const cors = require('cors');
require('dotenv').config();
const {graphqlHTTP} = require('express-graphql');
const port = process.env.PORT || 5000; 
const app = express();
const connectDB = require('./config/db')
const schema = require('./schema/schema.js');
// Connect to the database

connectDB();
app.use(cors());
app.use('/graphql', graphqlHTTP({
   schema, 
   graphiql: process.env.NODE_ENV === 'development',
}));
app.listen(port, console.log(`Server runnin on port ${port}`));
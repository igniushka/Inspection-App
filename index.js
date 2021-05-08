const express = require('express');
const { createPool } = require("mysql");
const app = express();
const port = process.env.PORT || 5000;

const pool = createPool({
    host:'eu-cdbr-west-01.cleardb.com',
    user:'b06e98fcde28f0',
    password:'cd51e4b0',
    database:'<dbname>',
    connectionLimit:10
});

pool.connect((err) => {
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});


var server = app.listen(5000, function () {
    console.log(`Server running on port ${port}, http://localhost:${port}`);
});

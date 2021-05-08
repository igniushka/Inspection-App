const express = require('express');
const mysql = require("mysql");
const app = express();
const port = process.env.PORT || 5000;


var connection = mysql.createConnection({
    host     : 'eu-cdbr-west-01.cleardb.com',
    user     : 'b06e98fcde28f0',
    password : 'cd51e4b0',
    database : 'heroku_05fce074f5dba05'
  });

  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
  });

var server = app.listen(port, function () {
    console.log(`Server running on port ${port}, https://investigation-server.herokuapp.com/:${port}`);
});

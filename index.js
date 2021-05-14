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
    
    //drop existing tables first
    connection.query("DROP TABLE user", function (err, result) {  
        if (err){console.log("failed to delete user table")} else console.log("user table deleted");  
});  



    var sql = "CREATE TABLE user (name VARCHAR(255), password VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("user table created");
  });
});


app.listen(port, function () {
    console.log(`Server running on port ${port}, https://investigation-server.herokuapp.com/:${port}`);
});

app.post('/signup', (req, res) => {
  console.log("Signup api post called")
  // console.log(req.body.username)
  return res.send('POST HTTP method on user resource');
});

app.get('/signup', (req, res) => {
  console.log("Signup api get called")
  // console.log(req.body.username)
  return res.send('POST HTTP method on user resource');
});
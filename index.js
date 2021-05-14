const express = require('express');
const mysql = require("mysql");
const app = express();
const port = process.env.PORT || 5000;

var db_config = {
  host: 'eu-cdbr-west-01.cleardb.com',
    user: 'b06e98fcde28f0',
    password: 'cd51e4b0',
    database: 'heroku_05fce074f5dba05'
};

var connection 


function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

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
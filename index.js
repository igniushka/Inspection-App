const express = require('express');
var router = express.Router();
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
  connection = mysql.createConnection(db_config); 
                                                 

  connection.connect(function(err) {             
    if(err) {                                    
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
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
                                         
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();                         
    } else {                                      
      throw err;                                  
    }
  });
}

handleDisconnect();



router.post('/signup', function (req, res, next) {
  console.log("Signup api post called")
  // console.log(req)
  // console.log(req.body)
  console.log(req.body)
  console.log(req.username)
  console.log(req.password)
  return res.json({
    message: 'Test'
  });
});

app.use(router)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.listen(port, function () {
  console.log(`Server running on port ${port}, https://investigation-server.herokuapp.com/:${port}`);
});
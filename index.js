const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = "A VERY SECRET SECRET"

const BAD_REQUEST = 400
const INTERNAL_SERVER_ERROR = 500
const MINUTE = 60
const HALF_HOUR = 30 * MINUTE


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
    connection.query("DROP TABLE token", function (err, result) {  
        if (err){console.log("failed to delete token table")} else console.log("user table deleted");  
    }); 



    var sql = "CREATE TABLE user (name VARCHAR(255) PRIMARY KEY, password VARCHAR(255))";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("user table created");
  });

  var sql = "CREATE TABLE token (name VARCHAR(255) PRIMARY KEY, token VARCHAR(255))";
  connection.query(sql, function (err, result) {
      if (err) throw err;
      console.log("token table created");
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

function returnInternalError(res){
  res.status(INTERNAL_SERVER_ERROR).json({
    message: 'An error occurred while processing request'
  });
}

function returnInvalidUsernameOrPassword(res){
  res.status(BAD_REQUEST).json({
    message: 'Invalid username or password'
  });
}

function validateString(input){
if (input){
  const myRegEx  = /[^a-z\d]/i;
  return !(myRegEx.test(input));
} else {return false}
}

router.post('/signup', (req, res) => {
  console.log("Signup api post called")
  const username = req.body.username
  const password = req.body.password
  if (validateString(username) && (validateString(password))){
    //check if username exist in the database
    var sql = "SELECT name FROM user WHERE name = '" + username+"'";
    connection.query(sql, function (err, result) {
      if (err) {return returnInternalError(res)}
      else {
        console.log(result)
        console.log(result.length)
        if (result.length == 0){
              //hash the password
             bcrypt.hash(password, 5).then(hash => {
              var sql = "INSERT INTO user (name, password) VALUES ('" + username + "', '"+ hash +"')";
              connection.query(sql, function (err, result) {
              if (err) {return returnInternalError(res)}
              else { return res.json({message: 'User created!'}); }
                });
               }) .catch(err =>{ return returnInternalError(res)}) 

        } else {
          return res.status(BAD_REQUEST).json({
            message: 'Choose a different Username'
          });
        }
      }
});
   
  } else {
   return res.status(BAD_REQUEST).json({
      message: 'Username and password must be alphanumeric'
    });
  }

});


router.post('/login', (req, res) => {
  console.log("Login api post called")
  const username = req.body.username
  const password = req.body.password
  if (validateString(username) && (validateString(password))){
    var sql = "SELECT * FROM user WHERE name = '" + username+"'";
    connection.query(sql, (err, result) => {
      if (err) {return returnInternalError(res)}
      else {
        if (result.length!=1){ return returnInvalidUsernameOrPassword(res); }
        else {
          var accessToken = jwt.sign({
            data: username
          }, SECRET, { expiresIn: MINUTE });
            //delete existing token first
            connection.query("DELETE FROM token WHERE name = '" + username+"'", (ignore) =>{
              //insert new token
              connection.query("INSERT INTO token (name, token) VALUES ('" + username + "', '"+ accessToken +"')", (err) => {
                if (err) {
                  console.log("failed to update token")
                  return returnInternalError(res)
                }
                else {
                  console.log("token updated") }
                  return res.json({message: 'Success!', token: accessToken});
                });
            })
        }}
      });
  } else {
    return res.status(BAD_REQUEST).json({
       message: 'Username and password must be alphanumeric'
     });
   }

});

router.post('/verify', (req, res) => {
  console.log("verify api post called")
  const accessToken = req.body.token
  if (accessToken){
    jwt.verify(accessToken, SECRET, (err, decoded) => {
      console.log(err)
      console.log(decoded)
      return res.json({message: 'Token ok'});
    });
  } else {
    return res.status(BAD_REQUEST).json({
       message: 'invalid access token'
     });
   }

});



app.use(router)
app.listen(port, function () {
  console.log(`Server running on port ${port}, https://investigation-server.herokuapp.com/:${port}`);
});
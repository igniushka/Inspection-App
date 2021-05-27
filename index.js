const express = require('express');
const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
const database = require('./models/database')
var connection = database.connection
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment= require( 'moment' )
const SECRET = "A VERY SECRET SECRET"
const BAD_REQUEST = 400
const UNAUTHORISED = 401
const INTERNAL_SERVER_ERROR = 500
const MINUTE = 60
const HALF_HOUR = 30 * MINUTE


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
          bcrypt.compare(password, result[0].password, (err, result) => {
            if(err){
              console.log("An error occurred while comparing passwords")
              return returnInternalError(res)
            } else if (result == false){
              return returnInvalidUsernameOrPassword(res)
            } else {
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
            }
           })
        }}
      });
  } else {
    return res.status(BAD_REQUEST).json({
       message: 'Username and password must be alphanumeric'
     });
   }

});
function verifyToken(req, res, next){
  console.log("verify api post called")
  const accessToken = req.body.token
  if (accessToken){
    jwt.verify(accessToken, SECRET, (err, decoded) => {
      if(err){
        return res.status(UNAUTHORISED).json({message: 'Token expired, please log in again'})
      }else{
        const name = decoded.data
        connection.query("SELECT * FROM token WHERE name = '" + name+"'", (err, result) => {
          if(err){
           return returnInternalError(res)
          }else{
            if(result.length == 1){ 
              if (result[0].token == accessToken){
                next()
              } else { 
                res.status(BAD_REQUEST).json({
                message: 'invalid access token' });
              }
            } else returnInternalError(res)
          }
        })
      }
    });
  } else {
    return res.status(BAD_REQUEST).json({
       message: 'invalid access token'
     });
   }
}

router.post('/verify', verifyToken, (req, res) => {
  return  res.json({message: 'Success!'})
});

router.post('/submitInspection', verifyToken, (req, res) => {
  let inspectionInfo = req.body.inspectionInfo
  let inspection = req.body.inspectionInfo.inspection
  let date = moment().format( 'YYYY-MM-DD  HH:mm:ss.000' );
  let sql = "INSERT INTO inspection (user, type, location, date) VALUES ('" + inspection.user + "', '"+ inspection.type + "', '"+ inspection.location + "', '"+  date  +"')";
  connection.query(sql, function (err, result) {  
    if (err){
      console.log("An error occured while inserting inspection")
    } else{
    console.log(req.body)
    return res.json({message: 'Success!'})
    } 
  });
});



app.use(router)
app.listen(port, function () {
  console.log(`Server running on port ${port}, https://investigation-server.herokuapp.com/:${port}`);
});
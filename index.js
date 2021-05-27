const express = require('express');
const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// const database = require('./models/database')
// var connection = database.connection
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const moment= require( 'moment' )
const SECRET = "A VERY SECRET SECRET"
const BAD_REQUEST = 400
const UNAUTHORISED = 401
const INTERNAL_SERVER_ERROR = 500
const MINUTE = 60
const HALF_HOUR = 30 * MINUTE


const mysql = require("mysql");
const HOST = "eu-cdbr-west-01.cleardb.com"
const USER = "b06e98fcde28f0"
const PASS = "cd51e4b0"
const DATABASE = "heroku_05fce074f5dba05"

var db_config = {
  host: HOST,
    user: USER,
    password: PASS,
    database: DATABASE
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
    


    var sql = "SELECT count(*) as cnt FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '"+DATABASE+"') AND (TABLE_NAME = 'token')"
    connection.query(sql, function (err, result) {  
      if (err){
        console.log("An error occured while selecting number of token tables")
      } else{
        if (result[0].cnt!=1){
          var sql = "CREATE TABLE token (name VARCHAR(255) PRIMARY KEY, token VARCHAR(255))";
          connection.query(sql, function (err, result) {
            if (err){
              console.log(err)
              throw err;
            } 
             console.log("token table created");
          });
        } else {
          console.log("token table already exists")
        }
      } 
    });

  
    var sql = "SELECT count(*) as cnt FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '"+DATABASE+"') AND (TABLE_NAME = 'inspection')"
    connection.query(sql, function (err, result) {  
      if (err){
        console.log("An error occured while selecting number of inspection tables")
      } else{
        if (result[0].cnt!=1){
          var sql = "CREATE TABLE inspection (id INT AUTO_INCREMENT PRIMARY KEY, user VARCHAR(255), type VARCHAR(255), location VARCHAR(255), date DATETIME, FOREIGN KEY (user) REFERENCES user(name) ON DELETE CASCADE)";
          connection.query(sql, function (err, result) {
          if (err){
            console.log(err)
            throw err;
          } 
             console.log("inspection table created");
          });
        } else {
          console.log("inspection table already exists")
        }
      } 
    });

    var sql = "SELECT count(*) as cnt FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '"+DATABASE+"') AND (TABLE_NAME = 'question')"
    connection.query(sql, function (err, result) {  
      if (err){
        console.log("An error occured while selecting number of question tables")
      } else{
        if (result[0].cnt!=1){
          var sql = "CREATE TABLE question (id INT AUTO_INCREMENT PRIMARY KEY, inspectionId INT, question VARCHAR(255), notApplicable BOOLEAN,  FOREIGN KEY (inspectionId) REFERENCES inspection(id) ON DELETE CASCADE)";
          connection.query(sql, function (err, result) {
          if (err){
              console.log(err)
              throw err;
            } 
             console.log("question table created");
          });
        } else {
          console.log("question table already exists")
        }
      } 
    });

    var sql = "SELECT count(*) as cnt FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '"+DATABASE+"') AND (TABLE_NAME = 'answer')"
    connection.query(sql, function (err, result) {  
      if (err){
        console.log("An error occured while selecting number of answer tables")
      } else{
        if (result[0].cnt!=1){
            var sql = "CREATE TABLE answer (id INT AUTO_INCREMENT PRIMARY KEY, questionId INT, answer VARCHAR(255), value INT,  FOREIGN KEY (questionId) REFERENCES question(id) ON DELETE CASCADE)";
            connection.query(sql, function (err, result) {
            if (err){
              console.log(err)
              throw err;
            } 
             console.log("answer table created");
          });
        } else {
          console.log("answer table already exists")
        }
      } 
    }); 

  var sql = "SELECT count(*) as cnt FROM information_schema.TABLES WHERE (TABLE_SCHEMA = '"+DATABASE+"') AND (TABLE_NAME = 'user')"
  connection.query(sql, function (err, result) {  
    if (err){
      console.log("An error occured while selecting number of user tables")
    } else{
      if (result[0].cnt!=1){
        var sql = "CREATE TABLE user (name VARCHAR(255) PRIMARY KEY, password VARCHAR(255))";
        connection.query(sql, function (err, result) {
          if (err){
            console.log(err)
            throw err;
          } 
           console.log("user table created");
        });
      } else {
        console.log("user table already exists")
      }
    } 
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
handleDisconnect()


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
  console.log(inspectionInfo)
  let inspection = inspectionInfo.inspection
  let date = moment().format( 'YYYY-MM-DD  HH:mm:ss.000' );
  let sql = "INSERT INTO inspection (user, type, location, date) VALUES ('" + inspection.user + "', '"+ inspection.type + "', '"+ inspection.location + "', '"+  date  +"')";
  connection.query(sql, (err, result) => {  
    if (err){
      console.log("An error occured while inserting inspection")
      return returnInternalError(res)
    } else {
        console.log("AAA")
        let inspectionId = result.insertId
        questionsCount = inspectionInfo.questions.length
        var currentQuestionNo = 0
        inspectionInfo.questions.forEach(questionInfo => {
          // console.log(questionInfo)
          console.log("BBB")
          currentQuestionNo++
          let question = questionInfo.question
          let sql = "INSERT INTO question (inspectionId, question, notApplicable) VALUES ('" + inspectionId + "', '"+ question.question + "', '"+ question.notApplicable +"')";
          connection.query(sql, (err, questionResult) => {  
            if (err){
              console.log("An error occured while inserting question") //if question failed to insert delete the inspection
              connection.query("DELETE FROM inspection WHERE id = '" + inspectionId+"'", (ignore) =>{
                // return returnInternalError(res)
              })        
            } else {
             let questionId = questionResult.insertId
             let answersCount = questionInfo.answer.length
             var currentAnswerNo = 0
              questionInfo.answer.forEach(answer =>{
                currentAnswerNo++
                let sql = "INSERT INTO answer (questionId, answer, value) VALUES ('" + questionId + "', '"+ answer.answer + "', '"+ answer.value +"')";
                connection.query(sql, (err) => {  
                  if (err){
                    console.log("An error occured while inserting answer") //if question failed to insert delete the inspection
                    connection.query("DELETE FROM inspection WHERE id = '" + inspectionId+"'", (ignore) =>{
                      // return returnInternalError(res)
                    })    
                  } else {
                    console.log("CCC")
                    if (currentQuestionNo == questionsCount && currentAnswerNo ==  answersCount){
                      console.log("All data inserted")
                      return res.json({message: 'Inspection inserted!'});
                    }
                  }
                })    

              })

            }
          })


        });
    }
  });

});


app.use(router)
app.listen(port, function () {
  console.log(`Server running on port ${port}, https://investigation-server.herokuapp.com/:${port}`);
});
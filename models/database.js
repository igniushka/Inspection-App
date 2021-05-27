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


exports.getConnection = function () {
    handleDisconnect();
    return connection
  }; 
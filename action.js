const http = require('http')
const fs = require('fs')
const mysql = require('mysql');
const qs = require('querystring')
const crypto = require('crypto')

const hostname = '127.0.0.1'
const port = 3000

function isEmail(email) {
  //var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  var emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== '' && email.match(emailFormat)) { return true; }
  
  return false;
}

function onRequest(req,res)
{
  var baseURL = 'http://' + req.headers.host + '/';
  var myURL = new URL(req.url, baseURL);
  
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/HTML')

  if(req.url == '/')
  {
    index(req,res)
  }
  else if(req.url == '/showsignin')
  {
    showsignin(req,res)
  }
  else if(req.url == '/dosignin')
  {
    dosignin(req,res)
  }
  else if(req.url == '/showsignup')
  {
    showsignup(req,res)
  }
  else if(req.url == '/dosignup')
  {
    dosignup(req,res)
  }
  else if(req.url=='/dashboard'){
    showdashboard(req,res)
  }
  else if(req.url=='/showbudget'){
    showbudget(req,res)
  }
  else if(req.url=='/showtickets'){
    showtickets(req,res)
  }
  else{
    res.end();
  }  
}

function showdashboard(req,res){
    fs.readFile('dashboard.html',function(err,data){
        res.write(data);
        return res.end();
    })
}

function showbudget(req,res){
    fs.readFile('budget.html',function(err,data){
        res.write(data);
        return res.end();
    })
}

function showtickets(req,res){
    fs.readFile('tickets.html',function(err,data){
        res.write(data);
        return res.end();
    })
}

function showsignup(req,res)
{
  fs.readFile('signup.html', function(err, data) {
    
    res.write(data);
    return res.end();
  });
}

function dosignup(req,res)
{
    var body = ''
    
    req.on('data', function(data) {
      body += data
      console.log('Partial body: ' + body)
    })
    
    req.on('end', function() {
      console.log('Body: ' + body)
      var qs = new URLSearchParams(body)
      var name = qs.get("fullname")
      var plaintext = qs.get('password')
      var sha256sum = crypto.createHash('sha256');

      var passwd = sha256sum.update(plaintext).digest('hex')
      var sha256sum = crypto.createHash('sha256');

      var confpasswd = sha256sum.update(qs.get('confirm_password')).digest('hex')
      var email = qs.get('email')


      if(passwd != confpasswd)
      {
        res.write("<h1>Password Mismatch</h1><br><a href='/showsignup'>Go back</a>")
        return res.end();
      }
      if(!isEmail(email)){
        res.write("<h1>Incorrect Email</h1><br><a href='/showsignup'>Go back</a>")
        return res.end();
      }

      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1111",
        database: "user"
      });

      con.connect(function(err) {
        
        if (err) throw err;
        
        console.log("Connected!");
        
        var sql = "INSERT INTO u_data (Name,email, passwd) VALUES (?,?,?)";
        con.query(sql,[name,email,passwd], function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
          
        });
      });

    })
    fs.readFile('dashboard.html', function(err, data) {
    
      res.write(data);
      return res.end();
    });
}

function dosignin(req,res)
{
    var body = ''
    
    req.on('data', function(data) {
      body += data
      console.log('Partial body: ' + body)
    })
    
    req.on('end', function() {
      console.log('Body: ' + body)
      var qs = new URLSearchParams(body)
      var email = qs.get("email")
      var plaintext = qs.get('password')
      var sha256sum = crypto.createHash('sha256');

      var passwd = sha256sum.update(plaintext).digest('hex')

      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1111",
        database: "user"
      });
    
      con.connect(function(err) {
        if (err) throw err;
        con.query("SELECT * FROM u_data where email=? and passwd=?",[email,passwd], 
        function (err, result, fields) 
        {
          if (err) throw err;

          console.log(result);
          if(result.length==1)
          {
            //res.write("<h1>Sign-In Successful</h1>")
            //res.end()
            fs.readFile('dashboard.html', function(err, data) {
    
              res.write(data);
              return res.end();
            });

          } 
          else
          {
            console.log(result);

            res.write("<h1>Sign-in Failed</h1>")
            res.end()

          }   
        });
      });
    })
}

function showsignin(req,res)
{
  fs.readFile('login.html', function(err, data) {
    
    res.write(data);
    return res.end();
  });
}

function index(req,res)
{
  fs.readFile('index.html', function(err, data) {
    res.write(data);
    return res.end();
  });
}

const server = http.createServer(onRequest)

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

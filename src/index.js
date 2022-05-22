const express = require('express');
const bodyParser=require('body-parser');
const path = require('path');
const winston = require('winston');
const reqcouch=require('request');

var urlencodedParser=bodyParser.urlencoded({extended:false});
const app = express();

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/',urlencodedParser, (req, res) => {

  var resp=9;
  const p=new Promise(function(resolve,reject){
    reqcouch({

      url:'http://admin:root@couchdb:5984/_all_dbs',
      method: 'GET',
      headers: {'content-type': 'application/json'}
    },function(error,response,body){
    if(error){res.send(error);return ;}
    else{
      
      resolve(resp=body);}
    
    });

  });


p.then(value=>{
  const environment = {
    title: 'Docker with Nginx and Express',
    node: process.env.NODE_ENV,
    instance: process.env.INSTANCE,
    port: process.env.PORT,
    couchdb: resp
  };
  // { environment }
  res.render('index');
});



  
});

app.listen(process.env.PORT, () => {
  winston.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  winston.info(`INSTANCE: ${process.env.INSTANCE}`);
  winston.info(`EXPRESS: ${process.env.PORT}`);
});

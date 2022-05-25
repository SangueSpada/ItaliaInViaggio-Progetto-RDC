const express = require('express');
const bodyParser=require('body-parser');
const path = require('path');
const winston = require('winston');
const { URLSearchParams } = require('url');
const { stringify } = require('querystring');
const qs=require('qs');
const axios=require('axios').default;
require('dotenv').config({path: path.join(__dirname,'/.env')});
var urlencodedParser=bodyParser.urlencoded({extended:false});
const app = express();

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/',urlencodedParser, (req, res) => {

  var resp;

const p=new Promise(function(resolve,reject){

let json={
  "selector":{
      "_id": {"$gt":null}
  },
  "fields": ["_id","_rev","nome","lat","long","zoom"]
};

axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
.then(function(response){resolve(resp=response.data.docs);})
.catch(function(error){res.send(error);return;});

  });


p.then(value=>{

  /*
  const environment = {
    title: 'Docker with Nginx and Express',
    node: process.env.NODE_ENV,
    instance: process.env.INSTANCE,
    port: process.env.PORT,
    couchdb: resp
  };*/
  // { environment }
  res.render('index',{api_key:process.env.API_MAPS,nomi:resp});
});



  
});

app.listen(process.env.PORT, () => {
  winston.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  winston.info(`INSTANCE: ${process.env.INSTANCE}`);
  winston.info(`EXPRESS: ${process.env.PORT}`);
});

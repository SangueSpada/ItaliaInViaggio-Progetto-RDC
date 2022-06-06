const express = require('express');
const app = express();
const bodyParser=require('body-parser');
const path = require('path');
const winston = require('winston');
const { URLSearchParams } = require('url');
const { stringify } = require('querystring');
const fs=require('fs');
const axios=require('axios').default;
require('dotenv').config({path: path.join(__dirname,'/.env')});
var urlencodedParser=bodyParser.urlencoded({extended:false});


const Trenitalia = require("api-trenitalia");
const moment = require('moment');
const { resolve } = require('path');

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var stazioni=JSON.parse(fs.readFileSync(path.join(__dirname, '../stazioni.json')));



app.get('/',urlencodedParser, (req, res) => {
  var resp;


  const p=new Promise(function(resolve,reject){


  //api couchdb all borgs names
  let json={
    "selector":{"_id": {"$gt":null}},
    "fields": ["_id","_rev","nome","regione","lat","long","zoom"]
  };

  axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
  .then(function(response){resolve(resp=response.data.docs);})
  .catch(function(error){res.send(error);return;});
  ///////////////////////////
    });


  p.then(value=>{

    res.render('index',{maps_key:process.env.API_MAPS, nomi:resp});
  });

});




app.get('/consigliati',urlencodedParser,function(req,res){
  
    res.render('consigliati',{stazioni:stazioni,results:[]});

  
});

app.post('/consigliati',urlencodedParser,function(req,res){
  var stazione=req.body.stazione;
  var resp;

  const p=new Promise(function(resolve,reject){


    //api couchdb all borgs names
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","lat","long"]
    };
  
    axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
    .then(function(response){resolve(resp=response.data.docs);})
    .catch(function(error){res.send(error);return;});
    ///////////////////////////
/*
 var lat=getlatfromtrenitalia(stazione)
 var lon=getlonfromtrenitalia(stazione);


*/



  });
  




});



app.get('/ao',urlencodedParser, (req, res) => {
  res.sendFile('src/views/ao.html');
  res.end();
});

app.post('/owm',urlencodedParser, function(req,res){
var url=req.body.url+"&lon="+req.body.lon+"&exclude="+req.body.exclude+"&appid="+req.body.appid+process.env.API_WHEATHER;
axios.get(url,{headers: {'Accept':'text/plain'}})
.then(function(response){res.status(200).send(response.data.daily);})
.catch(function(error){res.status(500).send(error);return;});


});


app.post('/borgo', urlencodedParser, function(req, res) {
  console.log('get /borgo');
  var checkin = req.body.CheckIn;
  var checkout = req.body.CheckOut;
  var luogo = req.body.testo_ricerca;
  var adulti = req.body.adulti;
  var ragazzi = req.body.ragazzi;
  ricerca = [luogo, checkin, checkout, adulti,ragazzi];
  var resp;
  var borg


  const p=new Promise(function(resolve,reject){
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["_id","_rev","nome","regione","lat","long","zoom","foto","descrizione"]
    };

    axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
    .then(function(response){resolve(resp=response.data.docs);})
    .catch(function(error){res.send(error);return;}); 
  });
  ///////////////////////////
    


  p.then(value=>{
    resp.forEach(item=>{
      if(item.nome==luogo){
        console.log(item);
        borg=item;
        return;
      }
    });
    res.render('titolo.ejs', { maps_key:process.env.API_MAPS, borgo: borg, search: ricerca,solutions:'', res: '' });
      

  });

});

app.get('/stazioni_autocomplete',urlencodedParser, async function(req,res){
  var stazioni;
  try{
    const t = new Trenitalia();
    stazioni = await t.autocomplete(req.query.term);
    var nomi=[];
    stazioni.forEach(item =>{nomi.push(item.name)});
    res.send(nomi);
  }
  catch (error){
    console.log(error);
    res.sendStatus(500);
  }
});

app.post('/searchTsolutions',urlencodedParser, async function(req, res) {
  var stazioneP=req.body.stazionePartenza;

  res.render('titolo.ejs', { maps_key:process.env.API_MAPS,nomi:resp, borgo: borg, search: ricerca, solutions:'', res: '' });

});
    




app.listen(process.env.PORT, () => {
  winston.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  winston.info(`INSTANCE: ${process.env.INSTANCE}`);
  winston.info(`EXPRESS: ${process.env.PORT}`);
});

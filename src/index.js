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
  let stazione=req.body.stazione;
  stazione=stazione.replaceAll(' ','%20');
  let tutti_borghi;
  let staz_andata;


  const p0=new Promise(function(resolve,reject){


    //api couchdb all borgs names
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","lat","long"]
    };
  
    axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
    .then(function(response){resolve(tutti_borghi=response.data.docs);})
    .catch(function(error){res.send(error);return;});
    ///////////////////////////
  });

  const p1=new Promise(function(resolve,reject){
    // api openstreetmap for coordinates of departure station
    axios.get('https://nominatim.openstreetmap.org/search?q='+stazione+',Italia&format=json&addressdetails=1',{headers: {'Accept':'json'}})
    .then(function(response){
      response=response.data;
        for(let i=0;i<response.length;i++){
          if(response[i].type==="station"){
            resolve(staz_andata=response[i]);
            break;
          }
        }
    })
    .catch(function(error){console.log(error);res.send(error);return;});

  ///////////////////////////////////////
  });

Promise.all([p0,p1]).then(value=>{
  if(!staz_andata){res.send('<h1>non è stata trovata la stazione con osm</h1>');res.end();}

  let lat=staz_andata.lat;
  let long=staz_andata.lon;

let consigliati;

consigliati=algoritmo_consigliati(parseFloat(lat),parseFloat(long),tutti_borghi);
console.log(consigliati);
res.render('consigliati',{stazioni:stazioni,results:consigliati,borghi:tutti_borghi});


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
  

 res.send(solutions);

});
    



function algoritmo_consigliati(lat,lon,borghi){

 // console.log(db);
  //console.log(lat);
  //console.log(lon);




let distanze=[];
for(let r=0;r<borghi.length;r++){
  let t={};
  t.nome=borghi[r].nome;
  t.distanza=getDistanceFromLatLonInKm(parseFloat(borghi[r].lat),parseFloat(borghi[r].long),parseFloat(lat),parseFloat(lon));
  distanze.push(t);
}

distanze.sort(compare_distance);

return distanze;

};

function compare_distance(a,b){

  if(a.distanza<b.distanza){
    return -1;
  }
  if(a.distanza>b.distanza){
    return 1;
  }
  return 0;

}



function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) { 
  var R = 6371; // Radius of the earth in km 
  var dLat = deg2rad(lat2-lat1);  // deg2rad below 
  var dLon = deg2rad(lon2-lon1);  
  var a =  
    Math.sin(dLat/2) * Math.sin(dLat/2) + 
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *  
    Math.sin(dLon/2) * Math.sin(dLon/2) 
    ;  
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));  
  var d = R * c; // Distance in km 
  return d; 
} 
 
function deg2rad(deg) { 
  return deg * (Math.PI/180) 
}



app.listen(process.env.PORT, () => {
  winston.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  winston.info(`INSTANCE: ${process.env.INSTANCE}`);
  winston.info(`EXPRESS: ${process.env.PORT}`);
});

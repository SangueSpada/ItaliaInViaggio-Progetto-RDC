const express = require('express');
const app = express();
const enablews=require('express-ws');
const bodyParser=require('body-parser');
const path = require('path');
const winston = require('winston');
var request=require('request');
const fs=require('fs');
const axios=require('axios').default;
const multer = require('multer');
var amqp=require('amqplib/callback_api')
const utils = require('./utilities');
const upload = multer();
require('dotenv').config({path: path.join(__dirname,'/.env')});
var urlencodedParser=bodyParser.urlencoded({extended:false});
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
enablews(app);
const Trenitalia = require('./trenitalia.js');

var meteo={};
var started=0;
var client_id = process.env.CLIENT_ID_CALENDAR;
var client_secret = process.env.SECRET_ID_CALENDAR;
var red_uri = process.env.RED_URI;



async function getborghifromcouchdb(){
  return new Promise(function(resolve){
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","regione","lat","long","foto","descrizione","stazione"]
    };
    axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
    // .then(function(response){console.log('response....');connected=1;resolve(resp=response.data.docs);})
    .then(function(response){resolve(resp=response.data.docs);}) 
    .catch(function(error){
      resolve(error);
    });
  });
}
////////////--gestione meteo--///////////////////
async function aggiorna_meteo(){
  var resp;
  let done=0;
  while(!done){
    resp=await getborghifromcouchdb();
    done=! Error(resp).message.includes('ECONNREFUSED');
  }
  let promises=[];
  for(let i=0;i<resp.length;i++){
    let url="https://api.openweathermap.org/data/2.5/onecall?lat="+resp[i].lat+"&lon="+resp[i].long+"&exclude=alerts&appid="+process.env.API_WHEATHER; 
    promises.push(new Promise(function(resolve,reject){
      axios.get(url)
      .then(function(result){
         // console.log(resp[i].nome);
        resolve(meteo[resp[i].nome]=result.data.daily);
      })
      .catch(function(error){
      console.log(error);
      resolve(error);
      });
    }));
  }
  Promise.all(promises).then(function(){
    //console.log(meteo);
    meteo["TimeStamp"]=new Date();
    let res=fs.writeFileSync(path.join(__dirname, 'public/meteo.json'),JSON.stringify(meteo));
    console.log('aggiornato meteo...');
    //console.log(JSON.parse(fs.readFileSync(path.join(__dirname, 'public/meteo.json'))))
    return;
  });
}
function ogni_3_ore(){
  meteo=JSON.parse(fs.readFileSync(path.join(__dirname, 'public/meteo.json')));
  let ins=process.env.INSTANCE;
  if(ins=='node1'){
  let ultimo_agg=new Date(meteo['TimeStamp']);
  let data_corrente=new Date();
  console.log('ultimo aggiornamento meteo: '+ultimo_agg);
  console.log('data corrente: '+data_corrente);
    if((Math.abs(data_corrente.valueOf()-ultimo_agg.valueOf()))<10800000){
      console.log('già aggiornato il meteo...');
      return;
    }
    else{
      console.log('aggiorno il meteo...');
      aggiorna_meteo();}
    }
  else{
    if(!started && (Math.abs(new Date().valueOf()-new Date(meteo['TimeStamp']).valueOf()))>30000000){
      console.log('è toccato a me: ['+ins+'] aggiornare al posto di node1');
      aggiorna_meteo();
      }
    started=1;
    console.log('leggo solo il meteo ...');
  }
}
ogni_3_ore();
setInterval(ogni_3_ore,10800000);

////////////--connessione a rabbitmq--///////////////////
var codaa;
var exchange='segnalazioni';
async function attiva_amqp_rabbitmq(){
  let resp;
  let done=0;
  while(!done){
    resp=await connessione_amqp();
    done=! Error(resp).message.includes('ECONNREFUSED');
  }
}
async function connessione_amqp(){

  return new Promise(function(resolve){
    amqp.connect('amqp://root:root@my_rabbitmq:5672',function(err,conn){
      if(err){
        // console.log(err);
        resolve(err);
        return;
      }
      conn.createChannel(function(err1,channel){
        if(err1){
          //console.log(err1);
          resolve(err1);
          return;
        }
        let ex=exchange;
        channel.assertExchange(ex,'direct',{durable: true});
        codaa=channel;
        resolve();
        /*channel.assertQueue('segnalazioni_utenti',{durable:true},function(err2,q){
          if(err2){
            console.log(err2);
            return;
          }
          channel.bindQueue(q.queue,exchange,'inattività');
        });*/
      });
    });
  });
}
attiva_amqp_rabbitmq();

app.ws('/ws',function(ws,req){
  ws.on('message', function incoming(message) { 
    console.log('///////////////////////////////////////////////////////////////////');
    let m=JSON.parse(message);
    console.log('received: %s', m);
    let topic=m["topic"];
    let nome=m["name"];
    let borgo=m["borgo"];
    try{
     codaa.publish(exchange,topic,Buffer.from(nome+','+borgo));
     ws.send('segnalazione ricevuta!'); 
    }
    catch(err){
      console.log(err);
      ws.send('errore nella segnalazione');
    }
  }); 
});

////////////--server--///////////////////
app.get('/',urlencodedParser, async (req, res) => {
  var resp= await getborghifromcouchdb();
  res.render('index',{maps_key:process.env.API_MAPS, nomi:resp});
});

app.get('/consigliati',urlencodedParser,function(req,res){
    res.render('consigliati',{results:[],err:'',search:[]});
});

app.post('/consigliati_meteo',urlencodedParser,async function(req,res){
  let stazione=req.body.stazione;
  let partenza=new Date(req.body.CheckIn);
  let ritorno= new Date(req.body.CheckOut);
  let ricerca = [req.body.stazione,req.body.CheckIn,req.body.CheckOut];

  partenza.setHours(0,0,1);
  ritorno.setHours(0,0,1);
  let min_date=addDays(new Date(),1);
  min_date.setHours(0,0,0);
  let max_date=addDays(min_date,6);
  max_date.setHours(23,59,59);

  if(!(partenza.valueOf()>=min_date.valueOf() && ritorno.valueOf()<=max_date.valueOf()) || partenza.valueOf()==ritorno.valueOf()){
    res.send('range date non valido');
    res.end();
    return;
  }
  
  stazione=stazione.replaceAll(' ','%20');
  let tutti_borghi;
  let staz_andata;

  const p0=new Promise(function(resolve,reject){
    //api couchdb all borgs names
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","regione","lat","long","foto","descrizione"]
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
      if(response.length==0){resolve();}
      else{
        for(let i=0;i<response.length;i++){
          if(response[i].type==="station"){
            resolve(staz_andata=response[i]);
            break;
          }
        }        resolve();
      }
    })
    .catch(function(error){console.log(error);res.send(error);return;});

  ///////////////////////////////////////
  });

  Promise.all([p0,p1]).then( async function(value){
    if(!staz_andata){

      res.render('consigliati',{search:ricerca,results:[],err:'stazione non trovata su open street map, riprovare con un\' altra'});

    return;}

    let lat=staz_andata.lat;
    let long=staz_andata.lon;
    let consigliati;



    consigliati= await algoritmo_consigliati(parseFloat(lat),parseFloat(long),tutti_borghi,partenza,ritorno);
    //console.log(consigliati);
    let date=getDates(partenza,ritorno,0);

    res.render('consigliati',{results:consigliati,dates:date, search:ricerca});
  });
});

app.post('/consigliati_treni',urlencodedParser,async function(req,res){
  let stazione=req.body.stazione;

  let partenza=new Date(req.body.CheckIn);
  let ritorno= new Date(req.body.CheckOut);
  let ricerca = [req.body.stazione,req.body.CheckIn,req.body.CheckOut];

  partenza.setHours(0,0,1);
  ritorno.setHours(0,0,1);
  let min_date=addDays(new Date(),1);
  min_date.setHours(0,0,0);
  let max_date=addDays(min_date,6);
  max_date.setHours(23,59,59);

  if(!(partenza.valueOf()>=min_date.valueOf() && ritorno.valueOf()<=max_date.valueOf()) || partenza.valueOf()==ritorno.valueOf()){
    res.send('range date non valido');
    res.end();
    return;
  }
  
  stazione=stazione.replaceAll(' ','%20');
  let tutti_borghi;
  let staz_andata;

  const p0=new Promise(function(resolve,reject){
    //api couchdb all borgs names
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","regione","lat","long","foto","descrizione","stazione"]
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
      if(response.length==0){resolve();}
      else{
        for(let i=0;i<response.length;i++){
          if(response[i].type==="station"){
            resolve(staz_andata=response[i]);
            break;
          }
        }        resolve();
      }
    })
    .catch(function(error){console.log(error);res.send(error);return;});

  ///////////////////////////////////////
  });

  Promise.all([p0,p1]).then( async function(value){
    if(!staz_andata){

      res.render('consigliati',{search:ricerca,results:[],err:'stazione non trovata su open street map, riprovare con un\' altra'});

    return;}

    let lat=staz_andata.lat;
    let long=staz_andata.lon;
    let consigliati;

    consigliati= await algoritmo_consigliati_treni(parseFloat(lat),parseFloat(long),tutti_borghi,partenza,ritorno,req.body.stazione);
    //console.log(consigliati);
    let date=getDates(partenza,ritorno,0);

    res.render('consigliati',{results:consigliati,dates:date, search:ricerca});
  });
});

app.post('/owm',urlencodedParser, function(req,res){
  console.log("owm");
  let m=meteo[req.body.name]; //response.data.daily 
  if(m=='undefined'){res.status(500).send('errore nome borgo non trovato');}
  else{
    res.status(200).send(m);
  }
});

app.get('/borgo', urlencodedParser, function(req, res) {
  console.log('get /borgo');
  var checkin = req.query.CheckIn;
  var checkout = req.query.CheckOut;
  var luogo = req.query.borgo;
  var adulti = req.query.adulti;
  var ragazzi = req.query.ragazzi;
  ricerca = [luogo, checkin, checkout, adulti,ragazzi];
  var resp;
  var borg
  let url="https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar&response_type=code&include_granted_scopes=true&state={}&redirect_uri=" + red_uri + "&client_id=" + client_id;


  const p=new Promise(function(resolve,reject){
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["_id","_rev","nome","regione","lat","long","zoom","foto","descrizione","stazione"]
    };

    axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
    .then(function(response){resolve(resp=response.data.docs);})
    .catch(function(error){res.send(error);return;}); 
  });   

  p.then(value=>{
    resp.forEach(item=>{
      if(item.nome==luogo){
        //console.log(item);
        borg=item;
        return;
      }
    });
    res.render('titolo.ejs', { maps_key:process.env.API_MAPS, borgo: borg, search: ricerca,solutions:'', res: '',url:url });
      

  });

});

app.get('/borghi',urlencodedParser,async function(req,res){
  
  const borghi=await getborghifromcouchdb();

  let results=[];
  for(let r=0;r<borghi.length;r++){
    let t={};
    t.nome=borghi[r].nome;
    t.regione=borghi[r].regione;
    t.lat=borghi[r].lat;
    t.lon=borghi[r].long;
    t.foto=borghi[r].foto;
    t.descrizione=borghi[r].descrizione;
    t.main=[];
    t.icona=[];
    results.push(t);
  }
  
  //distanze.sort(compare_distance);
  ////////////////////////////////// questo serve per il fuso orario con owm
  let p=new Date();
  let r=addDays(new Date(),7)
  r.setHours(23,59,59);
  p.setHours(0,0,0);
  let temp=[];
  for(let j=0;j<results.length;j++){
    temp.push(results[j]= await get_meteo_borgo(results[j],p,r));
  }
  let date=getDates(p,r,0);
  res.render('borghi',{borghi:results,dates:date});


});

app.get('/seteventcalendar',urlencodedParser,function(req,res){

  let a_t;
  let data = JSON.parse(req.query.state);
 
    
    var formData = {
        code: req.query.code,
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: red_uri,
        grant_type: 'authorization_code'
    }
request.post({ url: 'https://www.googleapis.com/oauth2/v4/token', form: formData, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, async function optionalCallback(err, httpResponse, body) {
  if (err) {
    res.end();
      return console.log('upload failed:', err);
  }
   var info = JSON.parse(body);
  console.log("Got the token " + info.access_token);
  a_t = info.access_token;
      


        var formData = {
            summary: data["nome"],
            description: data["descr"],
            location: 'Roma',
            colorId: '9',
            start: {
                dateTime: new Date(data["in"]),
            },
            end: {
                dateTime: new Date(data["out"]),
            },

        }

        axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events/', formData, { headers: { 'Authorization': 'Bearer ' + a_t, 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' } })
            .then(function(response) {
              res.write("<script>window.close();</" + "script>");
              res.end();
                //var info = JSON.parse(response);
                console.log("riuscito: " + JSON.stringify(response.data));
            })
            .catch(function(error) {
              res.write("<script>window.close();</" + "script>");
              res.end();
                return console.error('errore: ', error);

            });





    })
    /*
    .catch(function(err){
      console.log('upload failed:', err);
 
})*/


});

app.get('/stazioni_autocomplete',urlencodedParser, async function(req,res){
  const t = new Trenitalia();
  var stazioni = await t.autocomplete(req.query.term)
  var nomi=[];
  stazioni.forEach(item =>{
    if(! (item.name).includes('Tutte Le Stazioni')){
    nomi.push(item.name)}
  });
  res.send(nomi);
});

app.post('/searchTsolutions',upload.none(), async function(req, res) {
  const t = new Trenitalia();
  console.log(req.body);
  var IdSP = await t.autocomplete(req.body.stazionePartenza);
  var IdSA = await t.autocomplete(req.body.stazioneArrivo);
  var adulti = req.body.adulti;
  var bambini = req.body.ragazzi;
  let dp = (req.body.CheckInDate).split("-");
  var orarioP = new Date(parseInt(dp[0]),parseInt(dp[1])-1,parseInt(dp[2]),parseInt(req.body.oraPartenza)).toISOString().replace("Z","")+"+02:00";
  var solutions={};
  try{
  solutions.DepartureSolutions=await t.getOneWaySolutions(IdSP[0].id,IdSA[0].id,orarioP,adulti,bambini);
  }
  catch(e){
    res.send(e);
    console.log('andata '+e);
    return;
  }
  dp = (req.body.CheckOutDate).split("-");
  var orarioR = new Date(parseInt(dp[0]),parseInt(dp[1])-1,parseInt(dp[2]),parseInt(req.body.oraRitorno)).toISOString().replace("Z","")+"+02:00";
  try{
  solutions.BackSolutions = await t.getOneWaySolutions(IdSA[0].id,IdSP[0].id,orarioR,adulti,bambini);
  }
  catch(e){
    console.log('ritorno '+e);

    res.send(e);
    return;
  }
  res.send(solutions);
});
 
app.post('/api/consigliati_by_meteo',urlencodedParser,async function(req,res){

  let staz_par;
  let inn;
  let outt;
  let min_date=addDays(new Date(),1);
  min_date.setHours(0,0,0);
  let max_date=addDays(min_date,6);
  console.log("min_date: "+min_date);
  console.log("max_date "+ max_date)

try{
  staz_par=req.body.partenza;
  staz_par=staz_par.replaceAll(' ','%20');
  if(staz_par==''){
    res.status(400).send({'err':'inserire una stazione di partenza valida '});
    return;
  }

}
catch(err){
  res.status(400).send({'err':'inserire una stazione di partenza in partenza key '});
  return;
}

  let staz_andata;

   inn=new Date(req.body.checkin);
   inn.setHours(0,0,1);
   outt=new Date(req.body.checkout);
   outt.setHours(0,0,1);


   if(inn=='Invalid Date' || outt=='Invalid Date'){
    res.status(400).send({'err':'date non inserite o non valide'});
    return;
   }

   else if(!(inn.valueOf()>=min_date.valueOf() && outt.valueOf()<=max_date.valueOf()) || inn.valueOf()==outt.valueOf()){
    res.status(400).send({'err':'range date inserite non valido, la data deve essere compresa tra domani e 7 giorni'});
    return;
   }





const borghi=await getborghifromcouchdb();


const p1=new Promise(function(resolve,reject){
  // api openstreetmap for coordinates of departure station
  axios.get('https://nominatim.openstreetmap.org/search?q='+staz_par+',Italia&format=json&addressdetails=1',{headers: {'Accept':'json'}})
  .then(function(response){
    response=response.data;
    //console.log(response);
    if(response.length==0){
      resolve();}
    else{
      for(let i=0;i<response.length;i++){
        if(response[i].type==="station"){
          resolve(staz_andata=response[i]);
          break;
        }
      }
    resolve();}
  })
  .catch(function(error){res.status(400).send(error);return;});
});

p1.then( async function(value){
  //console.log(staz_andata);
  if(!staz_andata){
    res.status(400).send({'err':'stazione non trovata su open street map, riprovare con un\' altra'});
  return;}

  let lat=staz_andata.lat;
  let long=staz_andata.lon;

let consigliati;
consigliati= await algoritmo_consigliati(parseFloat(lat),parseFloat(long),borghi,inn,outt);
if(!consigliati){
  res.status(404).send({'err':'consigliati non trovati'});
  return;

}
else{
  let c;
  for(let r=0;r<consigliati.length;r++){
    c=consigliati[r];
    delete c.foto;
    delete c.punti;
    delete c.icona;
    delete c.punteggio;
  }
  
  
res.send({'result':consigliati})}

});






});

app.post('/api/consigliati_by_treno',urlencodedParser,async function(req,res){

  let staz_par;
  let inn;
  let outt;
  let min_date=addDays(new Date(),1);
  min_date.setHours(0,0,0);
  let max_date=addDays(min_date,6);
  console.log("min_date: "+min_date);
  console.log("max_date "+ max_date)

try{
  staz_par=req.body.partenza;
  staz_par=staz_par.replaceAll(' ','%20');
  if(staz_par==''){
    res.status(400).send({'err':'inserire una stazione di partenza valida '});
    return;
  }

}
catch(err){
  res.status(400).send({'err':'inserire una stazione di partenza in partenza key '});
  return;
}

  let staz_andata;

   inn=new Date(req.body.checkin);
   inn.setHours(0,0,1);
   outt=new Date(req.body.checkout);
   outt.setHours(0,0,1);


   if(inn=='Invalid Date' || outt=='Invalid Date'){
    res.status(400).send({'err':'date non inserite o non valide'});
    return;
   }

   else if(!(inn.valueOf()>=min_date.valueOf() && outt.valueOf()<=max_date.valueOf()) || inn.valueOf()==outt.valueOf()){
    res.status(400).send({'err':'range date inserite non valido, la data deve essere compresa tra domani e 7 giorni'});
    return;
   }





const borghi=await getborghifromcouchdb();


const p1=new Promise(function(resolve,reject){
  // api openstreetmap for coordinates of departure station
  axios.get('https://nominatim.openstreetmap.org/search?q='+staz_par+',Italia&format=json&addressdetails=1',{headers: {'Accept':'json'}})
  .then(function(response){
    response=response.data;
    //console.log(response);
    if(response.length==0){
      resolve();}
    else{
      for(let i=0;i<response.length;i++){
        if(response[i].type==="station"){
          resolve(staz_andata=response[i]);
          break;
        }
      }
    resolve();}
  })
  .catch(function(error){res.status(400).send(error);return;});

  
///////////////////////////////////////
});

p1.then( async function(value){
  //console.log(staz_andata);
  if(!staz_andata){
    res.status(400).send({'err':'stazione non trovata su open street map, riprovare con un\' altra'});
  return;}

  let lat=staz_andata.lat;
  let long=staz_andata.lon;

let consigliati;
consigliati= consigliati= await algoritmo_consigliati_treni(parseFloat(lat),parseFloat(long),borghi,inn,outt,req.body.partenza);
if(!consigliati){
  res.status(404).send({'err':'consigliati non trovati'});
  return;

}
else{
  let c;
  for(let r=0;r<consigliati.length;r++){
    c=consigliati[r];
    delete c.foto;
    delete c.punti;
    delete c.icona;
    delete c.punteggio;
  }
  
  
res.send({'result':consigliati})}

});






});

////////////---funzioni ausiliarie----//////////////////////

function addDays(date,days){
  let result=new Date(date.valueOf());
  result.setDate(result.getDate()+days);
  return result;
}

function getDates(start, end,flag) {
  if(flag){
    for (var arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
  }
  
  }

  else{
  for (var arr = [], dt = start; dt <= end; dt.setDate(dt.getDate() + 1)) {
      arr.push(dt.getDate()+'/'+(dt.getMonth()+1));
  }
}
  return arr;
}

async function algoritmo_consigliati(lat,lon,borghi,partenza,ritorno){

  return new Promise(async function(resolve){
    ritorno.setHours(23,59,59);
    partenza.setHours(0,0,0);
    //console.log('di js '+partenza.valueOf()+' '+ritorno.valueOf());
    // ordino per distanza i borghi
    let distanze=[];
    for(let r=0;r<borghi.length;r++){
      let t={};
      t.nome=borghi[r].nome;
      t.regione=borghi[r].regione;
      t.lat=borghi[r].lat;
      t.lon=borghi[r].long;
      t.punti=0;
      t.foto=borghi[r].foto;
      t.descrizione=borghi[r].descrizione;
      t.main=[];
      t.icona=[];
      t.distanza=getDistanceFromLatLonInKm(parseFloat(borghi[r].lat),parseFloat(borghi[r].long),parseFloat(lat),parseFloat(lon));
      distanze.push(t);
    }

    //distanze.sort(compare_distance);
    //////////////////////////////////
    let temp=[];
    for(let j=0;j<distanze.length;j++){
      //distanze[j]= get_meteo_borgo(distanze[j],partenza,ritorno);
      temp.push(distanze[j]= await get_meteo_borgo(distanze[j],partenza,ritorno));
    }

    function algoritmo(distanza,p_meteo,giorni){
      var media_meteo= p_meteo/giorni;
      var punteggio = distanza - (distanza*media_meteo)/200  // il meteo condiziona il 50% del punteggio calcolato in funzione della distanza 
      //punteggio = distanza -distanza*50%*media_punti_meteo%
      return punteggio; 
    }

    for(let k=0;k<distanze.length;k++){
      let d=distanze[k];
      var giorni = Math.ceil((ritorno.getTime() - partenza.getTime())/(1000 * 3600 * 24));
      console.log(giorni);
      d["punteggio"]=algoritmo(d.distanza,d.punti,giorni);
    }

    function compare_points(a,b){

      if(a.punteggio<b.punteggio){
        return -1;
      }
      if(a.punteggio>b.punteggio){
        return 1;
      }
      return 0;

    }
    distanze.sort(compare_points);
    resolve(distanze);
  });  
};
async function algoritmo_consigliati_treni(lat,lon,borghi,Dpartenza,Dritorno,Spartenza){

  //console.log("primooooo"+Spartenza);

  return new Promise(async function(resolve){
    Dritorno.setHours(12,00,00);
    Dpartenza.setHours(0,0,0);
    //console.log('di js '+partenza.valueOf()+' '+ritorno.valueOf());
    // ordino per distanza i borghi
    let distanze=[];
    for(let r=0;r<borghi.length;r++){
      let t={};
      t.nome=borghi[r].nome;
      t.regione=borghi[r].regione;
      t.stazione=borghi[r].stazione;
      t.lat=borghi[r].lat;
      t.lon=borghi[r].long;
      t.punti=0;
      t.foto=borghi[r].foto;
      t.descrizione=borghi[r].descrizione;
      t.main=[];
      t.icona=[];
      t.distanza=getDistanceFromLatLonInKm(parseFloat(borghi[r].lat),parseFloat(borghi[r].long),parseFloat(lat),parseFloat(lon));
      distanze.push(t);
    }

    let temp=[];
    for(let j=0;j<distanze.length;j++){
      //distanze[j]= get_meteo_borgo(distanze[j],partenza,ritorno);
      temp.push(distanze[j]= await get_meteo_borgo(distanze[j],Dpartenza,Dritorno));
    }

    async function algoritmo(StazP,StazR,dataP,dataR){
      const t = new Trenitalia();
      var IdSP = await t.autocomplete(StazP);
      //console.log("secondoooooo"+StazP);
      var IdSA = await t.autocomplete(StazR);
      var orarioP = String(dataP.toISOString()).replace("Z","")+"+02:00";
      var solutions={};
      try{
      solutions.DepartureSolutions=await t.getOneWaySolutions(IdSP[0].id,IdSA[0].id,orarioP,1,0,5);
      }
      catch(e){
        console.log('andata '+e);
        return 0;
      }
      var orarioR = String(dataR.toISOString()).replace("Z","")+"+02:00";
      try{
      solutions.BackSolutions = await t.getOneWaySolutions(IdSA[0].id,IdSP[0].id,orarioR,1,0,5);
      }
      catch(e){
        console.log('ritorno '+e);
        return 0;
      }
      var costo=0;
      var prezzi=[];
      (solutions.DepartureSolutions.solutions).forEach(item =>{
        var sol = item.solution;
        if(sol.price != null){
          prezzi.push(parseFloat(String(sol.price.amount)));
        }
      });
      costo+=Math.min.apply(Math,prezzi);
      (solutions.BackSolutions.solutions).forEach(item =>{
        var sol = item.solution;
        if(sol.price != null){
            prezzi.push(parseFloat(String(sol.price.amount)));
          }
      });
      costo+=Math.min.apply(Math,prezzi);
      prezzi=[];
      console.log(StazR+"= "+costo);
      return costo;
    }

    for(let k=0;k<distanze.length;k++){
      let d=distanze[k];
      //console.log('sssssssssssssssssssss'+Spartenza);
      d["costo"]=await algoritmo(Spartenza,d['stazione'],Dpartenza,Dritorno);
      d["punteggio"]=d["costo"];
    }

    function compare_points(a,b){
      if(a.punteggio<b.punteggio){
        return -1;
      }
      if(a.punteggio>b.punteggio){
        return 1;
      }
      return 0;
    }
    distanze.sort(compare_points);
    resolve(distanze);
  });  
};

function get_meteo_borgo(distanze,partenza,ritorno){
  const punti_meteo={
    Thunderstorm: 0,
    Drizzle: 32,
    Rain:20,
    Snow: 75,
    Mist:20,
    Smoke:20,
    Haze:20,
    Dust:12,
    Fog:20,
    Sand:12,
    Ash:4,
    Squall:0,
    Tornado:0,
    Clear:100,
    Clouds:70
  
  
  };

  let name=distanze.nome;
  let m=meteo[name]; //response.data.daily
  return new Promise(resolve =>{

    for(let k=0;k<8;k++){
      let dt=new Date(m[k].dt*1000).valueOf();

      if(dt>=partenza.valueOf() && dt<= (ritorno.valueOf())){
       
       let keyy=m[k].weather[0].main
       let punteggio=punti_meteo[keyy];
       distanze["main"].push(keyy);
       distanze["icona"].push(m[k].weather[0].icon);
       distanze["punti"]=distanze["punti"]+punteggio;
      }
    }
    resolve(distanze);
  });
 
}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) { 
  function deg2rad(deg) { 
    return deg * (Math.PI/180) 
  }
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
  d=Math.round(d, 2);
  return d; 
} 
////////////-----------------------//////////////////////


app.listen(process.env.PORT, () => {
//  winston.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  //winston.info(`INSTANCE: ${process.env.INSTANCE}`);
  //winston.info(`EXPRESS: ${process.env.PORT}`);
});

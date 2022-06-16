const express = require('express');
const app = express();
const bodyParser=require('body-parser');
const path = require('path');
const winston = require('winston');

const fs=require('fs');
const axios=require('axios').default;
require('dotenv').config({path: path.join(__dirname,'/.env')});
var urlencodedParser=bodyParser.urlencoded({extended:false});




app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
var stazioni=JSON.parse(fs.readFileSync(path.join(__dirname, '../stazioni.json')));
var meteo={};
var started=0;



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
  
  console.log(resp[i].nome);

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


async function getborghifromcouchdb(){
  return new Promise(function(resolve){

    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","lat","long"]
    };

    axios.post('http://admin:root@couchdb:5984/iiv_db/_find',json,{ headers:{'Content-Type': 'application/json'}})
    // .then(function(response){console.log('response....');connected=1;resolve(resp=response.data.docs);})
    .then(function(response){resolve(resp=response.data.docs);}) 
    .catch(function(error){
      
      resolve(error);});




  })

}

function ogni_3_ore(){
  meteo=JSON.parse(fs.readFileSync(path.join(__dirname, 'public/meteo.json')));
  let ins=process.env.INSTANCE;

  if(ins=='node1'){
  let ultimo_agg=new Date(meteo['TimeStamp']);
  let data_corrente=new Date();
  
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
     console.log('è toccato a me aggiornare al posto di node1');
      aggiorna_meteo();
    }
    started=1;
    console.log('leggo solo il meteo ...');

  }

}

ogni_3_ore();
setInterval(ogni_3_ore,10800000);


///////////////////////////////


const punti_meteo={

  Thunderstorm: 0,
  Drizzle: 10,
  Rain:5,
  Snow: 18,
  Mist:5,
  Smoke:4,
  Haze:7,
  Dust:4,
  Fog:4,
  Sand:3,
  Ash:3,
  Squall:0,
  Tornado:0,
  Clear:26,
  Clouds:16


};





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

app.post('/consigliati',urlencodedParser,async function(req,res){
  let stazione=req.body.stazione;
  let partenza=new Date(req.body.CheckIn);
  let ritorno= new Date(req.body.CheckOut);

  stazione=stazione.replaceAll(' ','%20');
  let tutti_borghi;
  let staz_andata;


  const p0=new Promise(function(resolve,reject){


    //api couchdb all borgs names
    let json={
      "selector":{"_id": {"$gt":null}},
      "fields": ["nome","lat","long","foto","descrizione"]
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

Promise.all([p0,p1]).then( async function(value){
  if(!staz_andata){console.log('<h1>non è stata trovata la stazione con osm</h1>');}

  let lat=staz_andata.lat;
  let long=staz_andata.lon;

let consigliati;



consigliati= await algoritmo_consigliati(parseFloat(lat),parseFloat(long),tutti_borghi,partenza,ritorno);
console.log(consigliati);
res.render('consigliati',{stazioni:stazioni,results:consigliati});


});



});


/*
app.get('/ao',urlencodedParser, (req, res) => {
  res.sendFile('src/views/ao.html');
  res.end();
});
*/
app.post('/owm',urlencodedParser, function(req,res){
  console.log("owm");
let m=meteo[req.body.name]; //response.data.daily

/*
var url='https://api.openweathermap.org/data/2.5/onecall?lat='+req.body.lat+'&lon='+req.body.lon+'&exclude=alerts&appid='+process.env.API_WHEATHER;
axios.get(url,{headers: {'Accept':'text/plain'}})
.then(function(response){res.status(200).send(response.data.daily);})
.catch(function(error){res.status(500).send(error);return;});
*/
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




  const p=new Promise(function(resolve,reject){

let nome=req.query.term;
    let url='https://www.lefrecce.it/Channels.Website.BFF.WEB/website/locations/search?name='+nome+'&limit=6' //chiamata REST a le frecce per autocomplete stazioni
    axios.get(url)
    .then(function(result){resolve(stazioni=result.data);})
    .catch(function(error){res.sendStatus(500).send(error);
                            return;});
      });
  
  
    p.then(value=>{
      var nomi=[];
      stazioni.forEach(item =>{nomi.push(item.name)});
      res.send(nomi);
  
    });
  


});

app.post('/searchTsolutions',urlencodedParser, async function(req, res) {
  var stazioneP=req.body.stazionePartenza;
  

 res.send(solutions);

});
    




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


for(let k=0;k<distanze.length;k++){
let d=distanze[k];
d["punteggio"]=d.distanza-(d.punti*2);


}

distanze.sort(compare_points);






//console.log(distanze);
resolve(distanze);


}); 


};



function get_meteo_borgo(distanze,partenza,ritorno){

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
  /*

  return new Promise(resolve=>{

    let url="https://api.openweathermap.org/data/2.5/onecall?lat="+distanze.lat+"&lon="+distanze.lon+"&exclude=alerts&appid="+process.env.API_WHEATHER; 


axios.get(url)
.then(function(result){

    for(let k=0;k<8;k++){
      let dt=new Date(result.data.daily[k].dt*1000).valueOf();

      if(dt>=partenza.valueOf() && dt<= (ritorno.valueOf())){
       
       let keyy=result.data.daily[k].weather[0].main
       let punteggio=punti_meteo[keyy];
       distanze["main"].push(keyy);
       distanze["icona"].push(result.data.daily[k].weather[0].icon);
       distanze["punti"]=distanze["punti"]+punteggio;

                                                            }
                        }
          resolve(distanze);

})
.catch(function(error){
  console.log(error);
  resolve(error);
});

  });

*/
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
//  winston.info(`NODE_ENV: ${process.env.NODE_ENV}`);
  //winston.info(`INSTANCE: ${process.env.INSTANCE}`);
  //winston.info(`EXPRESS: ${process.env.PORT}`);
});

const axios=require('axios').default;
const fs=require('fs');
const path = require('path');


var stazioni=JSON.parse(fs.readFileSync(path.join(__dirname, '/src/public/borghi.json')));
//console.log(stazioni.length);

for(let i=0;i<stazioni.length;i++){
    var s=stazioni[i];
let json={
    "nome":s.nome,
        "regione":s.regione,
        "lat":s.lat,
        "long":s.long,
        "zoom":s.zoom,
        "foto":s.foto,
        "descrizione":s.descrizione,
        "stazione":s.stazione
  

     };

     
  axios.post('http://admin:root@localhost:5984/iiv_db/',json,{ headers:{'Content-Type': 'application/json'}})
  .then(function(response){console.log(response);})
  .catch(function(error){console.log(error);return;});
  ///////////////////////////
  
}





/*

//usato per creare stazioni.json con solo i nomi, a partire da stazioni_completa

var stazioni=JSON.parse(fs.readFileSync(path.join(__dirname, '/stazioni_completa.json')));

var text='[';

var s;
var json;
for(let i=0;i<stazioni.length;i++){

    s=stazioni[i];

    if(i<stazioni.length-1){
json='{"name": '+'"'+s.name+'"},'
    }

else{
    json='{"name": '+'"'+s.name+'"}'}

text=text+json;


    


}


text=text+']';


fs.writeFileSync("./stazioni.json",text,'utf8',function(err){
  if(err){console.log(err);}
});

*/







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
        "descrizione":s.descrizione
  

     };

     
  axios.post('http://admin:root@localhost:5984/iiv_db/',json,{ headers:{'Content-Type': 'application/json'}})
  .then(function(response){console.log(response);})
  .catch(function(error){console.log(error);return;});
  ///////////////////////////
  
}

const chai = require('chai');
var expect = chai.expect;
const chaihttp = require('chai-http');
const describe = require('mocha').describe;
chai.use(chaihttp);
describe("POST /api/consigliati_by_meteo", () => {
    it("verify the request has a correct response", async () => {


      chai.request("https://localhost:443")
      .post('/api/consigliati_by_meteo')
      .set('Content-Type', 'application/json')
      .send({
        partenza: "Roma Termini",
        checkin: "2022/07/15",
        checkout: "2022/07/17"
      })
      .end(function (err, result) {
        if(err){
          console.error(err.message);
        }
        else{
          expect(result.status).to.equal(200);
          expect(result.body.result).to.not.be.undefined;
        }
     });


    
    });
    it("verify the request has a bad response: station not found", async () => {
      chai.request("https://localhost:443")
      .post('/api/consigliati_by_meteo')
      .set('Content-Type', 'application/json')
      .send({
            partenza: "stazione",
            checkin: "2022/07/15",
            checkout: "2022/07/17"
        })
      .end(function (err, result) {
        if(err){
          console.error(err.message);
        }
        else{
          expect(result.status).to.equal(400);
          expect(result.body.err).to.equal("stazione non trovata su open street map, riprovare con un' altra")
        }
      });
    });

    it("verify the request has a bad response: incorrect range dates", async () => {
      chai.request("https://localhost:443")
      .post('/api/consigliati_by_meteo')
      .set('Content-Type', 'application/json')
      .send({
            partenza: "Roma Termini",
            checkin: "2022/07/10",
            checkout: "2022/07/11"
        })
      .end(function (err, result) {
        if(err){
          console.error(err.message);
        }
        else{
          expect(result.status).to.equal(400);
          expect(result.body.err).to.equal("range date inserite non valido, la data deve essere compresa tra domani e 7 giorni")
        }
      });
    });
});
describe("POST /api/consigliati_by_treno", () => {
  it("verify the request has a correct response", async () => {

    chai.request("https://localhost:443")
    .post('/api/consigliati_by_treno')
    .set('Content-Type', 'application/json')
    .send({
      partenza: "Roma Termini",
      checkin: "2022/07/15",
      checkout: "2022/07/17"
    })
    .end(function (err, result) {
      if(err){
        console.error(err.message);
      }
      else{
        expect(result.status).to.equal(200);
        expect(result.body.result).to.not.be.undefined;
      }
   });


  
  });
  it("verify the request has a bad response: station not found", async () => {
    chai.request("https://localhost:443")
    .post('/api/consigliati_by_treno')
    .set('Content-Type', 'application/json')
    .send({
          partenza: "stazione",
          checkin: "2022/07/15",
          checkout: "2022/07/17"
      })
    .end(function (err, result) {
      if(err){
        console.error(err.message);
      }
      else{
        expect(result.status).to.equal(400);
        expect(result.body.err).to.equal("stazione non trovata su open street map, riprovare con un' altra")
      }
    });
  });

  it("verify the request has a bad response: incorrect range dates", async () => {
    chai.request("https://localhost:443")
    .post('/api/consigliati_by_treno')
    .set('Content-Type', 'application/json')
    .send({
          partenza: "Roma Termini",
          checkin: "2022/07/10",
          checkout: "2022/07/11"
      })
    .end(function (err, result) {
      if(err){
        console.error(err.message);
      }
      else{
        expect(result.status).to.equal(400);
        expect(result.body.err).to.equal("range date inserite non valido, la data deve essere compresa tra domani e 7 giorni")
      }
    });
  });
});


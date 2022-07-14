
const chai = require('chai');
var expect = chai.expect;
const chaihttp = require('chai-http');
const describe = require('mocha').describe;
chai.use(chaihttp);
describe("POST /api/consigliati", () => {
    it("verify the request has a correct response", async () => {


      chai.request("http://localhost:8080")
      .post('/api/consigliati')
      .set('Content-Type', 'application/json')
      .send({
        partenza: "Roma Termini",
        checkin: "2022/07/14",
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
      chai.request("http://localhost:8080")
      .post('/api/consigliati')
      .set('Content-Type', 'application/json')
      .send({
            partenza: "stazione",
            checkin: "2022/07/14",
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
      chai.request("http://localhost:8080")
      .post('/api/consigliati')
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


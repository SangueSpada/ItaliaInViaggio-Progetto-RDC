
const path = require('path');
require('dotenv').config({path: path.join(__dirname,'../.env')});
process.env.TEST=true;
const chai = require('chai');
var expect = chai.expect;
const chaihttp = require('chai-http');
const describe = require('mocha').describe;

const request = require("supertest");
const app = require("../index.js");

chai.use(chaihttp);

function addDays(date,days){
  let result=new Date(date.valueOf());
  result.setDate(result.getDate()+days);
  return result;
}

function formatdata(data){
  let d=data.toISOString().split('T')[0];
  d=d.replaceAll('-','/');
  return d;

}

let oggi=new Date();
let andata=addDays(oggi,1);
let ritorno=addDays(oggi,4);

let a=formatdata(andata);
let r=formatdata(ritorno);



describe("POST /api/consigliati_by_meteo", () => {
    it("verify the request has a correct response", async () => {
      let response = await request(app)
      .post('/api/consigliati_by_meteo')
      .set('Content-Type', 'application/json')
      .send({
        partenza: "Roma Termini",
        checkin: a,
        checkout: r
      })
      expect(response.statusCode).to.equal(200);
      console.log(response.body);
      expect(response.body.result).to.not.be.undefined;
    });
    it("verify the request has a bad response: station not found", async () => {
      let response = await request(app)
      .post('/api/consigliati_by_meteo')
      .set('Content-Type', 'application/json')
      .send({
            partenza: "stazione",
            checkin: a,
            checkout: r
        })
        expect(response.statusCode).to.equal(400);
        expect(response.body.err).to.equal("stazione non trovata su open street map, riprovare con un' altra")
    });

    it("verify the request has a bad response: incorrect range dates", async () => {
      let response = await request(app)
      .post('/api/consigliati_by_meteo')
      .set('Content-Type', 'application/json')
      .send({
            partenza: "Roma Termini",
            checkin: "2022/07/10",
            checkout: "2022/07/11"
        })
        expect(response.statusCode).to.equal(400);
        expect(response.body.err).to.equal("range date inserite non valido, la data deve essere compresa tra domani e 7 giorni")
    });
});

describe("POST /api/consigliati_by_treno", () => {
  it("verify the request has a correct response", async () => {
    let response = await request(app)
    .post('/api/consigliati_by_treno')
    .set('Content-Type', 'application/json')
    .send({
      partenza: "Roma Termini",
      checkin: a,
      checkout: r
    })
    expect(response.statusCode).to.equal(200);
    console.log(response.body);
    expect(response.body.result).to.not.be.undefined;
  });

  it("verify the request has a bad response: station not found", async () => {
    let response = await request(app)
    .post('/api/consigliati_by_treno')
    .set('Content-Type', 'application/json')
    .send({
          partenza: "stazione",
          checkin: a,
          checkout: r
      })
      expect(response.statusCode).to.equal(400);
      expect(response.body.err).to.equal("stazione non trovata su open street map, riprovare con un' altra")
  });

  it("verify the request has a bad response: incorrect range dates", async () => {
    let response = await request(app)
    .post('/api/consigliati_by_treno')
    .set('Content-Type', 'application/json')
    .send({
          partenza: "Roma Termini",
          checkin: "2022/07/10",
          checkout: "2022/07/11"
      })

      expect(response.statusCode).to.equal(400);
      expect(response.body.err).to.equal("range date inserite non valido, la data deve essere compresa tra domani e 7 giorni")
  });
});


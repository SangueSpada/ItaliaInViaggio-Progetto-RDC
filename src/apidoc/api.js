/**
 * * @api {post} /api/consigliati_by_meteo Ottieni i borghi consigliati in base al meteo e la distanza
 * @apiName consigliatiByMeteo
 * @apiGroup Consigliati
 * @apiDescription ricevi informazioni sui borghi consigliati a fronte di una stazione di partenza in formato json
 * @apiBody {String} partenza stazione di partenza
 * @apiBody {String} checkin Data formato GG/MM/AAAA
 * @apiBody {String} checkout Data formato GG/MM/AAAA
 * @apiSuccess (Success 200) {Json} Json_object Restituisce un oggetto avente una chiave result e valore lista di oggetti borghi.
 * @apiError (Error 4XX) {String} StazioneInvalida Inserire una stazione ferroviaria esistente su Trenitalia.
 * @apiSuccessExample {Json} Success
 * HTTP/1.1 200 OK
 * {
    "result": [
      {
      "nome": "Castel Gandolfo",
      "regione": "Lazio",
      "lat": "41.7487496",
      "lon": "12.6353254",
      "descrizione": "Splendidamente affacciato sul Lago Albano, Castel Gandolfo è noto per la bellezza della natura che lo circonda e per l’eleganza del centro storico cinto da mura, che l’ha fatto eleggere uno dei Borghi più belli d’Italia. Conosciuto anche per essere la residenza estiva dei papi, qui si trova il Palazzo Pontificio.",
      "main": [
        "Clear",
        "Clear"
      ],
      "distanza": 20
    },
    {
      "nome": "Tagliacozzo",
      "regione": "Abruzzo",
      "lat": "42.0689524",
      "lon": "13.2438809",
      "descrizione": "Borgo storico nel cuore d’Abruzzo, Tagliacozzo si estende nella gola della montagna ai piedi del monte Civita, immerso nella storia che dal Medioevo spazia fino al Barocco.La fonte più accreditata, per la spiegazione del suo nome, deriva dall’unione di due termini latini: Talus e Cotium, ovverosia 'taglio nella roccia'.",
      "main": [
        "Clear",
        "Clear"
      ],
      "distanza": 64
    },
      ...
      {
      "nome": "Vogogna",
      "regione": "Piemonte",
      "lat": "46.0178943",
      "lon": "8.2686205",
      "descrizione": "L’antico borgo di Vogogna, di origine medievale, è situato nel cuore dell’Ossola, a pochi chilometri dal Lago Maggiore, dal Lago d’Orta e dalla Svizzera. Entrato a far parte del Parco Nazionale della Val Grande, è ricco di tradizioni, di cultura e di storia.",
      "main": [
        "Clouds",
        "Rain"
      ],
      "distanza": 569
    }
      ]
    }   
 * 
 */
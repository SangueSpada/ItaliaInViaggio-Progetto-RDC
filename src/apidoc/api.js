/**
 * @api {post} /api/consigliati_by_meteo In base al meteo e alla distanza
 * @apiName consigliatiByMeteo 
 * @apiGroup Consigliati
 * @apiDescription Ottieni i borghi consigliati in base al meteo dei giorni in cui si vuole viaggiare e alla distanza dalla stazione di partenza.
 * @apiBody {String} partenza stazione di partenza
 * @apiBody {String} checkin Data formato AAAA/MM/GG
 * @apiBody {String} checkout Data formato AAAA/MM/GG
 * @apiSuccess (Success 200) {Json} result Restituisce un oggetto avente una chiave result e valore lista di oggetti borghi.
 * @apiError (Error 400) {Json} StazioneInvalida Inserire una stazione ferroviaria esistente.
 * @apiError (Error 400) {Json} DateInvalide Le date inserite non rispettano il range di date disponibili.
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
 * @apiSuccessExample {Json} StazioneInvalida
 * HTTP/1.1 400 Bad Request
 * {
  "err": "stazione non trovata su open street map, riprovare con un' altra"
} 
 * @apiSuccessExample {Json} DateInvalide
 * HTTP/1.1 400 Bad Request
 * {
  "err": "range date inserite non valido, la data deve essere compresa tra domani e 7 giorni"
}
*/
/**
 * @api {post} /api/consigliati_by_treno In base al costo del treno
 * @apiName consigliatiByTreno 
 * @apiGroup Consigliati
 * @apiDescription Ottieni i borghi consigliati in base al costo del viaggio in treno che si vuole a partire da stazione di partenza e date del viaggio. 
 * @apiBody {String} partenza stazione di partenza
 * @apiBody {String} checkin Data formato AAAA/MM/GG
 * @apiBody {String} checkout Data formato AAAA/MM/GG
 * @apiSuccess (Success 200) {Json} result Restituisce un oggetto avente una chiave result e valore lista di oggetti borghi. 
 * @apiError (Error 400) {Json} StazioneInvalida Inserire una stazione ferroviaria esistente.
 * @apiError (Error 400) {Json} DateInvalide Le date inserite non rispettano il range di date disponibili.
 * @apiSuccessExample {Json} Success
 * HTTP/1.1 200 OK
 * {
  "result": [
    {
      "nome": "Castel Gandolfo",
      "regione": "Lazio",
      "stazione": "Castel Gandolfo",
      "lat": "41.7487496",
      "lon": "12.6353254",
      "descrizione": "Splendidamente affacciato sul Lago Albano, Castel Gandolfo è noto per la bellezza della natura che lo circonda e per l’eleganza del centro storico cinto da mura, che l’ha fatto eleggere uno dei Borghi più belli d’Italia. Conosciuto anche per essere la residenza estiva dei papi, qui si trova il Palazzo Pontificio.",
      "main": [
        "Clear",
        "Clear"
      ],
      "distanza": 20,
      "costo": 4.2
    },
    {
      "nome": "Tagliacozzo",
      "regione": "Abruzzo",
      "stazione": "Tagliacozzo",
      "lat": "42.0689524",
      "lon": "13.2438809",
      "descrizione": "Borgo storico nel cuore d’Abruzzo, Tagliacozzo si estende nella gola della montagna ai piedi del monte Civita, immerso nella storia che dal Medioevo spazia fino al Barocco.La fonte più accreditata, per la spiegazione del suo nome, deriva dall’unione di due termini latini: Talus e Cotium, ovverosia 'taglio nella roccia'.",
      "main": [
        "Clear",
        "Clear"
      ],
      "distanza": 64,
      "costo": 12.6
    },
    ...
        {
      "nome": "Vipiteno",
      "regione": "Trentino A.A.",
      "stazione": "Vipiteno Val Vizze/sterzing Pfitsch",
      "lat": "46.89475",
      "lon": "11.4116006",
      "descrizione": "Casette colorate, viuzze dello shopping, pittoresche piazze medievali e un paesaggio di montagna che sembra a portata di mano: la città alpina di Vipiteno in Valle Isarco incanta i suoi visitatori con un fascino unico.",
      "main": [
      ],
      "distanza": 562,
      "costo": 140.95
    }
  ]
}
 * @apiSuccessExample {Json} StazioneInvalida
 * HTTP/1.1 400 Bad Request
 * {
  "err": "stazione non trovata su open street map, riprovare con un' altra"
} 
 * @apiSuccessExample {Json} DateInvalide
 * HTTP/1.1 400 Bad Request
 * {
  "err": "range date inserite non valido, la data deve essere compresa tra domani e 7 giorni"
}
 */
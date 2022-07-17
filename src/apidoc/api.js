/**
 * * @api {post} /api/consigliati_by_meteo Ottieni i borghi consigliati in base al meteo e la distanza
 * @apiName consigliatiByMeteo
 * @apiGroup Consigliati
 * @apiDescription ricevi informazioni sui borghi consigliati a fronte di una stazione di partenza in formato json
 * @apiBody {String} partenza stazione di partenza
 * @apiBody {String} checkin Data formato GG/MM/AAAA
 * @apiBody {String} checkout Data formato GG/MM/AAAA
 * @apiSuccess (Success 200) {Json} Json_object Restituisce un oggetto avente una chiave result e valore lista di oggetti borghi.
 * @apiSuccessExample {Json} Success
 * HTTP/1.1 200 OK
 * {
    "result": [
      {
        "nome": "Brisighella",
        "regione": "Emilia Romagna",
        "lat": "44.2237502",
        "lon": "11.7573768",
        "descrizione": "L’antico borgo medioevale si distingue per la spiccata vocazione all’ospitalità e al turismo sostenibile, tanto da essere inserito nel club dei Borghi più belli d’Italia e certificato dal Touring Club Italiano con la 'Bandiera Arancione'.",
        "main": [],
        "distanza": 265
      },
      {
        "nome": "Chiusa",
        "regione": "Trentino A.A.",
        "lat": "46.6719942",
        "lon": "11.4809913",
        "descrizione": "La cittadina si estende tra le rocce del promontorio di Sabiona e il fiume Isarco. Un susseguirsi di facciate romantiche, chiese gotiche e lo spettacolare Monastero Benedettino di Sabiona.",
        "main": [],
        "distanza": 537
      },
      {
        "nome": "Orta San Giulio",
        "regione": "Piemonte",
        "lat": "45.7964467",
        "lon": "8.405217",
        "descrizione": "L’antico borgo di Orta San Giulio si colloca lungo le acque del Lago d’Orta: un punto strategico ed oggi uno dei palcoscenici ideali da cui ammirare il piccolo specchio d’acqua. A poche centinaia di metri da Piazza Motta, cuore del borgo, proprio sulla punta del promontorio, si scorge l’Isola di San Giulio poco distante.",
        "main": [],
        "distanza": 544
      },
      ...
      {
        "nome": "Spello",
        "regione": "Umbria",
        "lat": "42.9913514",
        "lon": "12.6447022",
        "descrizione": "Il paese, abbarbicato su uno sperone del Monte Subasio, quasi a dominare la Valle Umbra, è una meraviglia da scoprire con lentezza, perdendosi tra i suoi vicoli profumati e le sue stradine lastricate che vi condurranno alla scoperta di un centro storico coloratissimo.",
        "main": [],
        "distanza": 122
      }
      ]
    }   
 * @apiError (Error 4XX) {String} StazioneInvalida {'err':'inserire una stazione di partenza valida '}  
 */
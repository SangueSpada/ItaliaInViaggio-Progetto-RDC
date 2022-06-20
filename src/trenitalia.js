const axios=require('axios');
const tough = require('tough-cookie');
const qs = require('querystring');
//const axiosCookieJarSupport = require('axios-cookiejar-support').default;


class Trenitalia {
    constructor(apiUrl) {
        this.cookieJar = new tough.CookieJar();
        this.apiUrl = apiUrl || 'https://www.lefrecce.it/Channels.Website.BFF.WEB/website/';
        this.api = axios.create({
            baseURL: this.apiUrl,
            responseType: 'json',
            headers: { 'User-Agent': 'api-trenitalia 2.0' },
            withCredentials: true
        });

        // Supporto per sessioni (molte chiamate non funzionerebbero altrimenti)
        //axiosCookieJarSupport(this.api);
        //this.api.defaults.jar = new tough.CookieJar();
        //this.isLogged = false;
    }

    _sendError(message, error = null) {
        if (!error) throw message;
        throw `${message} - ${error.message ? error.message : 'Unknown error'}`;
    }

    /**
     * Funzione di autocompletamento nomi stazioni, torna un array dei primi n oggetti trovati,  contenti id, nome e tag della stazione
     * @param {string} text Testo da cercare 
     * @param {int} n Massimo numero di risultati 
     */
     async autocomplete(text,n) {
        try {
            const result = await this.api.get('locations/search', {
                params: {
                    name: text,
                    limit: n || 10
                }
            });
            return result ? result.data : null;
        } catch (error) {
            this._sendError('Error while retrieving the data from AUTOCOMPLETE', error);
        }
    }

    /**
     * Cerca soluzioni di viaggio in ANDATA. Prende questi parametri in input:
     * @param {int} stazionePartenza L'ID della stazione di partenza
     * @param {int} stazioneArrivo L'ID della stazione di arrivo
     * @param {Date} orarioPartenza Data e ora della partenza in formato Date AAAA-MM-DDTHH:MM:00.000+02:00
     * @param {int} adulti Il numero di passeggeri adulti
     * @param {int} bambini Il numero di passeggeri bambini
     */
     async getOneWaySolutions(stazionePartenza, stazioneArrivo, orarioPartenza, adulti, bambini) {
        const request =  {
            "departureLocationId": stazionePartenza,
            "arrivalLocationId": stazioneArrivo,
            "departureTime": orarioPartenza,
            "adults": adulti,
            "children": bambini
        }
        try {
            const result = await this.api.post('ticket/solutions',request,{headers: {'Content-Type': 'application/json'} });
            return result ? result.data : null;
        } catch (error) {
            this._sendError('Error while retrieving the data GetOneWaySolutions', error);
        }
    }

     /**
     * Metodo di utility per gestire chiaamte simili alle API dato un ID soluzione
     * @param {string} cartId 
     * @param {string} solutionId 
     */
      async internalGetSolution(cartId, solutionId) {
        try {
            const result = await this.api.get('cart', {
                params: {
                    cartId: cartId,
                    currentSolutionId: solutionId
                }
            });
            return result ? result.data : null;
        } catch (error) {
            this._sendError('Error while retrieving the data', error);
        }
    }

    /**
     * Dettagli di una soluzione
     * Funziona solo se c'è già una sessione aperta con il sito
     * @param {string} idCart
     * @param {string} idSolution 
     */
    async getSolutionDetails(idCart,idSolution) {
        return await this.internalGetSolution(idCart,idSolution);
    }


}


module.exports = Trenitalia

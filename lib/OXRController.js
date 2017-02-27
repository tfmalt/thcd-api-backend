const rp = require('request-promise-native');

/**
 * Object to handle all communication with the open exchange rate service
 * in one place.
 */
class OXRController {
  constructor() {
    this.url = 'https://openexchangerates.org/api/latest.json';
    this.oxrLatest = {};

    // this.getLatest(this.url, process.env.OXR_APP_ID);
  }

  /**
   * Fetches the latest set of exchange rate data.
   * Returns locally cacehed copy if it is still fresh.
   *
   * @param {string} url to the api resource
   * @param {string} appid Your app id to use the service
   * @returns {Promise} promise to always have predictable return type.
   */
  getLatest() {
    // Avoid unneccessary calls to api and only refresh twice a day.
    if (this.cacheIsFresh(this.oxrLatest, 1800)) {
      return Promise.resolve(this.oxrLatest);
    }

    if (process.env.OXR_APP_ID === 'undefined') {
      throw new TypeError('the OXR_APP_ID environment variable must be set');
    }

    return rp.get({
      uri: this.url,
      qs:  {
        app_id: process.env.OXR_APP_ID
      },
      json: true
    }).then( (data) => {
      // console.log('got data from oxr: ', data);
      this.oxrLatest = data;
      return this.oxrLatest;
    }).catch( (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Got error from service:', error.message);
      }
    });
  }

  /**
   * boolean to verify if the cached version is fresh or not
   *
   * @param {object} cache The cached version
   * @param {number} timeout How stale the cache can be in seconds
   * @returns {boolean} true or false baby
   */
  cacheIsFresh(cache, timeout = 1800) {
    let now = Math.round(Date.now() / 1000);

    if (
      cache.hasOwnProperty('timestamp') &&
      (now - cache.timestamp) < timeout
    ) {
      return true;
    }

    return false;
  }

  rate(currency) {
    return this.oxrLatest.rates[currency];
  }

  exchange(options = {}) {
    if (!options.hasOwnProperty('currency') || !options.hasOwnProperty('value')) {
      throw new TypeError(
        'Argument to exchange function must be an object with the structure: ' +
        '{ currency: <string>, value: <float> }'
      );
    }

    if (options.currency === this.oxrLatest.base) {
      return options.value;
    }

    return parseFloat((options.value / this.rate(options.currency)).toFixed(4));
  }
}

module.exports = OXRController;

const rp = require('request-promise-native');

/**
 * Object to cleanly deal with the exchange rate serice in one place.
 */
class OXRController {
  constructor() {
    this.url = 'https://openexchangerates.org/api/latest.json';
    this.oxrLatest = {};

    this.getLatest(this.url, process.env.OXR_APP_ID);
  }

  /**
   * Fetches the latest set of exchange rate data.
   * Returns locally cacehed copy if it is still fresh.
   *
   * @param {string} url to the api resource
   * @param {string} appid Your app id to use the service
   * @returns {Promise} promise to always have predictable return type.
   */
  getLatest(url, appid = 'foobar') {
    // Avoid unneccessary calls to api and only refresh twice a day.
    if (this.cacheIsFresh(this.oxrLatest, 1800)) {
      return Promise.resolve(this.oxrLatest);
    }

    return rp.get({
      uri: url,
      qs:  {
        app_id: appid
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
}

module.exports = OXRController;

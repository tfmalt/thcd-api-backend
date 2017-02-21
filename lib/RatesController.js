const OXRController  = require('./OXRController');
const PortRatesModel = require('./PortRatesModel');

/**
 * A controller object to abstract the logic away from the express app router
 */
class RatesController {
  constructor() {
    this.oxr = new OXRController();
    this.prm = new PortRatesModel();
  }

  /**
   * List of countries seen in data as an array
   *
   * @return {array} List of countries seen as two letter country codes.
   */
  get countries() {
    return this.prm.countries;
  }

  /**
   * Calculate and return the distribution of data for a given coutnry
   *
   * @param {string} country Two letter ISO 3166-1 alpha-2 country code.
   * @return {object} object to be returned as json later.
   */
  distribution(country) {
    let data        = this.getData(country);
    let percentiles = this.getPercentiles(data);
    let average     = this.getAverage(data);

    return {percentiles, data, average};
  }

  /**
   * returns an array of perentile data points in the given data
   *
   * @param {array} data Data structure to parse.
   * @return {object} object of key percentile points
   */
  getPercentiles(data) {
    // base our cut of points on deviation from the median based on percentiles
    return {
      first:  data[0],
      10:     data[Math.round(data.length * 0.1)],
      20:     data[Math.round(data.length * 0.2)],
      median: data[Math.round(data.length * 0.5)],
      80:     data[Math.round(data.length * 0.8)],
      90:     data[Math.round(data.length * 0.9)],
      last:   data[data.length - 1]
    };
  }

  /**
   * Calculates the average value in us dollars and returns it as a float
   *
   * @param {array} data The data to calculate from
   * @return {float} The average amount.
   */
  getAverage(data) {
    return parseFloat(
      (data.reduce(
        (acc, value) => (acc + value.usd_amount), 0
      ) / data.length).toFixed(4)
    );
  }

  /**
   * Fetches the data as parsed by the rates Model
   *
   * @param {string} country Two letter ISO 3166-1 alpha-2 country code.
   * @return {object} the data structure sorted by default array sort.
   */
  getData(country) {
    let data = this.prm.ratesByCountry[country].map( (item) => {
      item.usd_amount = this.oxr.exchange({
        currency: item.currency,
        amount:   item.value
      });

      return item;
    }).sort( (a, b) => {
      return a.usd_amount - b.usd_amount;
    });

    return data;
  }
}

module.exports = RatesController;

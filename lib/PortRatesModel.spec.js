const chai = require('chai');
const chap = require('chai-as-promised');
const PortRatesModel = require('./PortRatesModel');

chai.use(chap);

const expect = chai.expect;

let rm = new PortRatesModel();

describe('Port Rates Model', () => {
  describe('Instanciation', () => {
    it('should be created successfully', () => {
      expect(rm).to.be.an('object');
    });

    it('should be an instance of PortRatesModel', () => {
      expect(rm).to.be.instanceOf(PortRatesModel);
    });
  });

  describe('Loading the model', () => {
    it('should load the model and return a correctly formatted data set', () => {
      return expect(rm.loadModel())
        .to.eventually.contain.deep.keys(['HK', 'CN', 'US']);
    });
  });

  describe('The functions', () => {
    it('countries should return the correct list of countries', () => {
      expect(rm.countries).to.have.members(['CN', 'HK', 'US']);
    });

    it('calculateUSDValues should calculate the correct values', () => {
      let data = [{currency: 'NOK', value: 100}, {currency: 'SEK', value: 100}];
      return expect(rm.calculateUSDValues(data)).to.eventually.have.deep.property('[1].usd');
    });

    it('organizeDataByCountry should return properly organised data', () => {
      let data = [{port: 'ABCDE'}, {port: 'BCDEF'}, {port: 'CDEFG'}];
      return expect(rm.organizeDataByCountry(data))
        .to.deep.equal({
          AB: {
            rates: [{port: 'ABCDE'}]
          },
          BC: {
            rates: [{port: 'BCDEF'}]
          },
          CD: {
            rates: [{port: 'CDEFG'}]
          }
        });
    });
  });
});

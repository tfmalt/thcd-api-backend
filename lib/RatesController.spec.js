
const chai = require('chai');
const chap = require('chai-as-promised');
const RatesController = require('../lib/RatesController');

chai.use(chap);

const expect = chai.expect;

describe('Rates Controller', () => {
  it('should be created successfully', () => {
    let rc = new RatesController();
    expect(rc).to.be.an('object');
  });

  it('should be an instance of RatesController', () => {
    let rc = new RatesController();
    expect(rc).to.be.instanceOf(RatesController);
  });
});

describe('Rates Controller parseData', () => {
  it('should complete successfully', () => {
    let rc = new RatesController();
    expect(rc.parseData([{port: 'ABCDE'}])).to.be.true;
  });

  it('should throw TypeError with incorrect data', () => {
    let rc  = new RatesController();
    // let res = rc.parseData("");
    expect(rc.parseData.bind(rc, false)).to.throw(TypeError, /must be an array/);
  });
});

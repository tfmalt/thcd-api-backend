# THCD API Backend Service

This is a proof of concept web app given to me as a programming challenge.
The acronym stands for **Terminal Handling Charge Distribution**. Don't ask me
why, it was the best name I could come up with.

To run this service you need a working APP_ID on
[open exchange rates](https://openexchangerates.org/).

#### TL;DR

```
$ npm install https://github.com/tfmalt/thcd-api-backend.git
$ OXR_APP_ID=<your openexchangerates app id> npm start
```

## About the application

Front-end and back-end is completely split into two different repositories:

- <https://github.com/tfmalt/thcd-web-frontend>
- <https://github.com/tfmalt/thcd-api-backend>

The front-end is deployed to github pages with
[gh-pages](https://www.npmjs.com/package/gh-pages), and can be found
_in production_ on:

- <https://thcd.malt.no/>

The backend is aiming to be a [node.js](https://nodejs.org/en/) -
[express](http://expressjs.com/) stateless micro-service, with a nginx server
doing TLS termination and routing in front.

The complete separation of front-end and back-end code is a conscious
architectural decision. The intended effect is better decoupling,
testability, and scalability of development effort. Development teams can
have completely separate release schedules and focus on integration- and
end-to-end testing when doing QA, similar to integrating with an external
API source.

## About testing

I've implemented a [mocha](https://mochajs.org/)-[chai](http://chaijs.com/)
based test suite as a an example of how I would implement tests in a
production system.

I've not prioritized implementing a complete suite of tests at this stage.
There are three reasons for this:

1. I wanted to focus on getting the actual solution done, not spend too much
   time on ceremonies and formalities.

2. One can argue that the cost of investing in extensive unit-testing in the
   exploratory phase of development, where only one, or a small team (2-3)
   of developers, are working on the code is not worth it.

   Rather it would
   be most efficient to defer extensive investment in testing until the size
   and complexity of the application warranted it.

3. I'm lazy, and it's boring, and it feels like waste,  when I want to
   continue doing the fun stuff, which is learning a new framework and
   finding my way around how to make the application work.

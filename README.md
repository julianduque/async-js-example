# Asynchronous JavaScript Examples

Evolution of different async approaches from pure Callback Hell ([server.js](https://github.com/julianduque/async-js-example/blob/master/server.js)) to `async / await` ([server-micro.js](https://github.com/julianduque/async-js-example/blob/master/server-micro.js))

* [server.js](https://github.com/julianduque/async-js-example/blob/master/server.js) - callback approach, no functions, just callback hell
* [server-flatten.js](https://github.com/julianduque/async-js-example/blob/master/server-flatten.js) - callback approach, named functions, more organized
* [server-after.js](https://github.com/julianduque/async-js-example/blob/master/server-after.js) - callback approach, use external modules for workflow (`after`)
* [server-async.js](https://github.com/julianduque/async-js-example/blob/master/server-async.js) - callback approach, use `async.js` for workflows
* [server-async-flatten.js](https://github.com/julianduque/async-js-example/blob/master/server-async-flatten.js) - callback approach, use `async.js` for workflows, separation of concerns (more organized and maintainable)
* [server-promise.js](https://github.com/julianduque/async-js-example/blob/master/server-promise.js) - native promise approach, wrap async functions with `new Promise`
* [server-promisify.js](https://github.com/julianduque/async-js-example/blob/master/server-promisify.js) - native promise approach, use `promisify` modules to implement Promise based APIs
* [server-co.js](https://github.com/julianduque/async-js-example/blob/master/server-co.js) - native promise approach with `co` and generators
* [server-micro.js](https://github.com/julianduque/async-js-example/blob/master/server-micro.js) - async/await with `micro` framework


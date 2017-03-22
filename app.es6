global.APP_ROOT = __dirname;

// require('./lib/document.js');

Promise.all([
  // require('./lib/scraper.es6').default,
  require('./lib/session_test.es6').default('201204$[RD]', 1, 200),
]).then(function() {
  console.log('All operations completed.');
});

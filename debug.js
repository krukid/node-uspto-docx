require('babel-register');
require('babel-polyfill');

global.APP_ROOT = __dirname;
require('./lib/single_form.es6');

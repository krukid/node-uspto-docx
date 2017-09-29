require('babel-register');
require('babel-polyfill');

global.APP_ROOT = __dirname;
require('./lib/tasks/single_form.es6');
// require('./lib/tasks/regen_forms.es6');
// require('./lib/tasks/delete_supplemental.es6');

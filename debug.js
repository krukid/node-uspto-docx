require('babel-register');
require('babel-polyfill');

global.APP_ROOT = __dirname;
// require('./lib/tasks/single_form.es6');
// require('./lib/tasks/regen_forms.es6');
// require('./lib/tasks/delete_supplemental.es6');
// require('./lib/tasks/find_invalid.es6');
require('./lib/tasks/find_invalid_all.es6');
// require('./lib/tasks/test_tor.es6');
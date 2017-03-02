// var fs = require('fs');
// var page = require('webpage').create();
//
// page.open('http://ask.fm/krukid', function(status) {
//   console.log('Status: ' + status);
//   page.go('http://ask.fm', function(st2) {
//     if (st2 === 'success') {
//       var title = page.evaluate(function() {
//         return document.title;
//       });
//       console.log('GOT: ' + title);
//     }
//     phantom.exit();
//   })
//   // if (status === 'success') {
//   //   page.render('./output/example.png');
//   // }
//
// });

// //
// page = require('').create({
//   session: (args) => ({
//     url: '...',
//     method: 'GET',
//     query: {}
//   })
// });
//
// await page.session();
// await page.go({url: '...', method: 'GET', query: {...}, clearCookie: true, addCookie: {}});
// page.$('.y .z .x').text();

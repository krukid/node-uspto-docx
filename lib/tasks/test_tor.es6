// prerequisites (host machine):
//   docker run --rm -p 7000:7000 --env EXIT_NODES="{us}" tor 7000
//   docker run --rm --net=host -it -v "$(pwd):/app" -w /app uspto
//      npm install socks-proxy-agent

var url = require('url');
var http = require('http');
var SocksProxyAgent = require('socks-proxy-agent');

// SOCKS proxy to connect to
var proxy = process.env.socks_proxy || 'socks://127.0.0.1:7000';
console.log('using proxy server %j', proxy);

// HTTP endpoint for the proxy to connect to
var endpoint = process.argv[2] || 'http://icanhazip.com';
console.log('attempting to GET %j', endpoint);
var opts = url.parse(endpoint);

// create an instance of the `SocksProxyAgent` class with the proxy server information
var agent = new SocksProxyAgent(proxy);
opts.agent = agent;

http.get(opts, function (res) {
  console.log('"response" event!', res.headers);
  res.pipe(process.stdout);
});

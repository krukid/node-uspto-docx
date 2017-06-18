import Rq from 'request';
import Rp from 'request-promise';
import http from 'http';
import Url from 'url';
import iconv from 'iconv-lite';
import charset from 'charset';

const NET_TIMEOUT_MS = 30000;

export const RpSearch = Rp.defaults({
  timeout: NET_TIMEOUT_MS,
  gzip: true,
  headers: {
    'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  },
});

export function rqLogo(url) {
  return Rq({
    url,
    timeout: NET_TIMEOUT_MS,
    gzip: true,
    headers: {
      'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6',
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      'Accept': 'image/webp,image/*,*/*;q=0.8',
    },
  });
}

export function setCookie(jar, url, hash) {
  Object.keys(hash).forEach(function(key) {
    const cookieStr = `${key}=${encodeURIComponent(hash[key])}`;
    const cookie = Rp.cookie(cookieStr);
    jar.setCookie(cookie, url);
  })
}

export function I18nGet(url) {
  return new Promise(function(resolve, reject) {
    const options = {
      ...Url.parse(url),
      timeout: NET_TIMEOUT_MS
    };
    const req = http.get(options, function(res) {
      const chunks = [];
      res.on('data', function(chunk) {
        chunks.push(chunk);
      });
      res.on('end', function() {
        const body = Buffer.concat(chunks);
        const metaCharset = charset(res.headers['content-type']);
        // const bodyCharset = metaCharset || jschardet.detect(body).encoding.toLowerCase();
        resolve(iconv.decode(body, metaCharset));
      });
    });
    req.on('error', reject);
  });
}

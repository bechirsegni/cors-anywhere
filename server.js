// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || '0.0.0.0';
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

var cors_proxy = require('./lib/cors-anywhere');
cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  requireHeader: [],
  checkRateLimit: checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    // Strip Heroku-specific headers
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
    // Other Heroku added debug headers
     'x-forwarded-for',
     'x-forwarded-proto',
     'x-forwarded-port',
  ],
  setHeaders:[
          {"x-gr-application":"iOS App" },
          {"Authorization":"OAuth"},
          {"realm": ""},
          {"oauth_consumer_key":"T7rSxXydAsZg0dU3PJzFhw"},
          {"oauth_token":"JhzxMxXLNkptCKxcXGQXg"},
          {"oauth_signature_method":"HMAC-SHA1"},
          {"oauth_signature":"nlK0nEpF8mhcPZnnW309xQT%2Fw0Q%3D"},
          {"oauth_timestamp":"1611930497"},
          {"oauth_nonce":"1815D290-FA94-4B83-9721-F43AB32DAC59"},
          {"oauth_version":"1.0"},
          {"Accept":"*/*"},
          {"X_APPLE_DEVICE_MODEL":"iPhone"},
          {"x-gr-os-version":"iOS 14.4"},
          {"Accept-Language":"en-ES;q=1, ru-ES;q=0.9"},
          {"X_APPLE_APP_VERSION":"702"},
          {"x-gr-app-version":"702"},
          {"x-gr-hw-model":"iPhone13,2"},
          {"X_APPLE_SYSTEM_VERSION":"14.4"}
  ]
  redirectSameOrigin: true,
  httpProxyOptions: {
    // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
    xfwd: false,
  },
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});

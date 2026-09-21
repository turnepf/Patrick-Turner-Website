// Serves the static site from ./public. The only logic: plain http, www and
// any other stray hostname permanently redirect to https://patrickturner.net.
const CANONICAL = 'patrickturner.net';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (!local && (url.hostname !== CANONICAL || url.protocol !== 'https:')) {
      url.hostname = CANONICAL;
      url.protocol = 'https:';
      url.port = '';
      // Built by hand rather than with Response.redirect: this response never
      // touches env.ASSETS, so public/_headers does not apply to it and HSTS
      // has to be set here. Without it a visitor who only ever types the www
      // host never gets the apex's includeSubDomains pin.
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};

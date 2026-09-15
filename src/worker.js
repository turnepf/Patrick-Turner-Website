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
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};

// Serves the static site from ./public. The only logic: www and any other
// stray hostname permanently redirect to the apex domain.
const CANONICAL = 'patrickturner.net';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname !== CANONICAL && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      url.hostname = CANONICAL;
      url.protocol = 'https:';
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};

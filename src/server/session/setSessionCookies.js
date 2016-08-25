import config from 'config'

const COOKIE_OPTIONS = {
  // signed: true,
  httpOnly: false,
  overwrite: true,
  maxAge: 1000 * 60 * 60,
  domain: config.rootCookieDomain,
};

export default (ctx, session) => {
  ctx.cookies.set('token', session.tokenString, {
    ...COOKIE_OPTIONS,
    expires: session.expires,
    maxAge: session.expires * 1000,
  });
};

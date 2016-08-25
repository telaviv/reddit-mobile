export const clearDeprecatedCookies = (ctx) => {
  // these cookies are deprecated on non root domains.
  ctx.cookies.set('loid');
  ctx.cookies.set('loidcreated');
  ctx.cookies.set('token');

  ctx.cookies.set('tokenExpires');
  ctx.cookies.set('refreshToken');
  ctx.cookies.set('reddit_session');
};

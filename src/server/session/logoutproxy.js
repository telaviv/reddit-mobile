import config from 'config';

export default (router) => {
  router.post('/logout', async (ctx/*, next*/) => {
    ctx.cookies.set('token', '', { domain: config.rootCookieDomain });
    ctx.cookies.set('over18');
    ctx.cookies.set('compact');
    ctx.cookies.set('theme');
    ctx.redirect('/');
  });
};

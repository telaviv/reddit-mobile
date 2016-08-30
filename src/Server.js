import 'babel-polyfill';

import KoaStatic from 'koa-static';
import cluster from 'cluster';
import { cpus } from 'os';

import Server from '@r/platform/Server';
import { dispatchInitialShell } from '@r/platform/plugins';
import APIOptions from '@r/api-client';

import config from 'config';
import errorLog from 'lib/errorLog';
import routes from 'app/router';
import main from 'server/templates/main';
import reducers from 'app/reducers';
import reduxMiddleware from 'app/reduxMiddleware';
import loginproxy from 'server/session/loginproxy';
import logoutproxy from 'server/session/logoutproxy';
import registerproxy from 'server/session/registerproxy';
import refreshproxy from 'server/session/refreshproxy';
import dispatchSession from 'server/session/dispatchSession';
import { clearDeprecatedCookies } from 'server/initialState/clearDeprecatedCookies';
import { dispatchInitialCompact } from 'server/initialState/dispatchInitialCompact';
import { dispatchInitialLoid } from 'server/initialState/dispatchInitialLoid';
import { dispatchInitialMeta } from 'server/initialState/dispatchInitialMeta';
import { dispatchInitialOver18 } from 'server/initialState/dispatchInitialOver18';
import { dispatchInitialTheme } from 'server/initialState/dispatchInitialTheme';
import { dispatchInitialRecentSubreddits } from 'server/initialState/dispatchInitialRecentSubreddits';
import metaRoutes from 'server/meta';

import dispatchInitialCollapsedComments from
  'server/initialState/dispatchInitialCollapsedComments';

const buildFiles = KoaStatic('build');
const processes = process.env.PROCESSES || cpus().length;

// If we miss catching an exception, format and log it before exiting the
// process.
process.on('uncaughtException', function (err) {
  // errorLog will be console.logging the formatted output
  errorLog({
    error: err,
    userAgent: 'SERVER',
  }, {
    hivemind: config.statsURL,
  });

  process.exit();
});

// Log promise rejection events as well, these are likely to be errors
// in the api endpoints. Logging is better than 1x now that we're trying
// harder to parse the error location and get the stack
process.on('unhandledRejection', function(rejection) {
  // errorLog will be console.logging the formatted output
  errorLog({
    rejection,
    userAgent: 'SERVER',
  }, {
    hivemind: config.statsURL,
  });
});

// Note: shhh, some of these things have to be here and never in
// config.js because they're server only secrets.
const ConfigedAPIOptions = {
  ...APIOptions,
  origin: 'https://www.reddit.com',
  oauthAppOrigin: 'https://m.reddit.com',
  clientId: process.env.SECRET_OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_SECRET,
  servedOrigin: process.env.ORIGIN || `http://localhost:${config.port}`,
  statsURL: config.statsURL,
  actionNameSecret: process.env.ACTION_NAME_SECRET,
};

export function startServer() {
  console.log(`Started server at PID ${process.pid}`);
  // Create and launch the server
  return Server({
    port: config.port,
    routes,
    template: main,
    reducers,
    reduxMiddleware,
    dispatchBeforeNavigation: async (ctx, dispatch/*, getState, utils*/) => {
      dispatchInitialShell(ctx, dispatch);
      clearDeprecatedCookies(ctx);
      dispatchInitialLoid(ctx, dispatch);
      await dispatchSession(ctx, dispatch, ConfigedAPIOptions);
      dispatchInitialTheme(ctx, dispatch);
      dispatchInitialCollapsedComments(ctx, dispatch);
      dispatchInitialCompact(ctx, dispatch);
      dispatchInitialMeta(ctx, dispatch);
      dispatchInitialOver18(ctx, dispatch);
      dispatchInitialRecentSubreddits(ctx, dispatch);
    },
    preRouteServerMiddleware: [
      buildFiles,
    ],
    getServerRouter: router => {
      // private routes for login, logout, register, and token refresh
      loginproxy(router, ConfigedAPIOptions);
      logoutproxy(router, ConfigedAPIOptions);
      registerproxy(router, ConfigedAPIOptions);
      refreshproxy(router, ConfigedAPIOptions);
      metaRoutes(router, ConfigedAPIOptions);
    },
  })();
}

export function workerExit(failedProcesses, worker) {
  if (failedProcesses < 20) {
    console.log(`Worker ${worker.process.pid} died, restarting.`);
    cluster.fork();
    failedProcesses++;
  } else {
    console.log('Workers died too many times, exiting.');
    process.exit();
  }
}

export function startCluster() {
  let failedProcesses = 0;

  cluster.setupMaster();

  for (let i = 0; i < processes; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => workerExit(failedProcesses, worker));
  cluster.on('exit', () => failedProcesses++);

  console.log(`Started cluster with ${processes} processes.`);
}

if (cluster.isMaster && processes > 1) {
  startCluster();
} else {
  startServer();
}

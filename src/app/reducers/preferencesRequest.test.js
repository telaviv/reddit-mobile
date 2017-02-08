import createTest from '@r/platform/createTest';

import preferencesRequest, { DEFAULT } from './preferencesRequest';
import * as loginActions from 'app/actions/login';
import * as preferenceActions from 'app/actions/preferences';

createTest({ reducers: { preferencesRequest }}, ({ getStore, expect }) => {
  describe('preferencesRequest', () => {
    describe('LOGGING_IN and LOGGED_OUT', () => {
      it('should return default on log in', () => {
        const { store } = getStore({
          preferencesRequest: {
            succeeded: true,
            pending: false,
            failed: false,
          },
        });

        store.dispatch(loginActions.loggingIn());
        const { preferencesRequest } = store.getState();
        expect(preferencesRequest).to.eql(DEFAULT);
      });

      it('should return default on log out', () => {
        const { store } = getStore({
          preferencesRequest: {
            succeeded: true,
            pending: false,
            failed: false,
          },
        });

        store.dispatch(loginActions.loggedOut());
        const { preferencesRequest } = store.getState();
        expect(preferencesRequest).to.eql(DEFAULT);
      });
    });

    describe('PENDING', () => {
      it('should set pending to true and clear error states', () => {
        const { store } = getStore({
          preferencesRequest: {
            succeeded: false,
            pending: false,
            failed: true,
          },
        });

        store.dispatch(preferenceActions.pending());
        const { preferencesRequest } = store.getState();
        expect(preferencesRequest).to.eql({
          succeeded: false,
          pending: true,
          failed: false,
        });
      });
    });

    describe('RECEIVED', () => {
      it('should set pending and error to false and succeed to true', () => {
        const { store } = getStore({
          preferencesRequest: {
            succeeded: false,
            pending: true,
            failed: false,
          },
        });

        store.dispatch(preferenceActions.received({}));
        const { preferencesRequest } = store.getState();
        expect(preferencesRequest).to.eql({
          succeeded: true,
          pending: false,
          failed: false,
        });
      });
    });

    describe('FAILED', () => {
      it('should set failed to true and everything else to false', () => {
        const { store } = getStore({
          preferencesRequest: {
            succeeded: false,
            pending: true,
            failed: false,
          },
        });

        store.dispatch(preferenceActions.failed({}));
      });
    });
  });
});

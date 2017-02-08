import { fetchUserBasedData } from 'app/router/handlers/handlerCommon';

export const LOGGED_IN = 'LOGGED_IN';
export const loggedIn = () => ({ type: LOGGED_IN });

export const LOGGED_OUT = 'LOGGED_OUT';
export const loggedOut = () => ({ type: LOGGED_OUT });

export const LOGGING_IN = 'LOGGING_IN';
export const loggingIn = () => ({ type: LOGGING_IN });

export const login = () => async (dispatch) => {
  dispatch(loggingIn());
  await fetchUserBasedData(dispatch);
  dispatch(loggedIn());
};

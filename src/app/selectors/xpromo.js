import { find, some } from 'lodash';

import { flags as flagConstants } from 'app/constants';
import features from 'app/featureFlags';

const {
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL,
  VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL,
} = flagConstants;

const EXPERIMENT_NAMES = {
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS]: 'mweb_xpromo_require_login_fp_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID]: 'mweb_xpromo_require_login_fp_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS]: 'mweb_xpromo_require_login_listing_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID]: 'mweb_xpromo_require_login_listing_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL]: 'mweb_xpromo_require_login_fp_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL]: 'mweb_xpromo_require_login_fp_android',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL]: 'mweb_xpromo_require_login_listing_ios',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL]: 'mweb_xpromo_require_login_listing_android',
};

function extractUser(state) {
  if (!state.user || !state.accounts) {
    return;
  }
  return state.accounts[state.user.name];
}

export function loginRequiredEnabled(state) {
  const featureContext = features.withContext({ state });
  return some([
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
  ], (feature) => { return featureContext.enabled(feature); });
}

function loginExperimentName(state) {
  const featureContext = features.withContext({ state });
  const featureFlag = find([
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL,
    VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL,
    VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL,
  ], (feature) => { return featureContext.enabled(feature); });
  return featureFlag ? EXPERIMENT_NAMES[featureFlag] : null;
}

export function isPartOfXPromoExperiment(state) {
  return !!loginExperimentName(state);
}

export function currentExperimentData(state) {
  const user = extractUser(state);
  const experimentName = loginExperimentName(state);
  const variant = user.features[experimentName].variant;
  return { experimentName, variant };
}

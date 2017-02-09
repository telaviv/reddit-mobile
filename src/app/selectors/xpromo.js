import { find, some } from 'lodash';

import { flags as flagConstants } from 'app/constants';
import features from 'app/featureFlags';
import getSubreddit from 'lib/getSubredditFromState';
import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { getExperimentData } from 'lib/experiments';

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
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS]: 'mweb_xpromo_require_login_fp_ios_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID]: 'mweb_xpromo_require_login_fp_android_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS]: 'mweb_xpromo_require_login_listing_ios_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID]: 'mweb_xpromo_require_login_listing_android_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS_CONTROL]: 'mweb_xpromo_require_login_fp_ios_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID_CONTROL]: 'mweb_xpromo_require_login_fp_android_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS_CONTROL]: 'mweb_xpromo_require_login_listing_ios_v2',
  [VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID_CONTROL]: 'mweb_xpromo_require_login_listing_android_v2',
};

export function xpromoIsEnabledOnPage(state) {
  const routeMeta = getRouteMetaFromState(state);
  const actionName = routeMeta && routeMeta.name;
  return actionName === 'index' || (actionName === 'listing' && !isNSFWPage(state));
}

function isNSFWPage(state) {
  const { subreddits } = state;
  const subredditName = getSubreddit(state);

  if (!subredditName) {
    return true;
  }

  const subredditInfo = subreddits[subredditName.toLowerCase()];
  if (subredditInfo) {
    return subredditInfo.over18;
  }
  return true;
}

export function loginRequiredEnabled(state) {
  const featureContext = features.withContext({ state });
  return (
    shouldShowXPromo(state) &&
    state.user.loggedOut &&
    some([
      VARIANT_XPROMO_LOGIN_REQUIRED_FP_IOS,
      VARIANT_XPROMO_LOGIN_REQUIRED_FP_ANDROID,
      VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_IOS,
      VARIANT_XPROMO_LOGIN_REQUIRED_SUBREDDIT_ANDROID,
    ], feature => featureContext.enabled(feature))
  );
}

export function shouldShowXPromo(state) {
  return state.smartBanner.showBanner && xpromoIsEnabledOnPage(state);
}

function loginExperimentName(state) {
  if (!shouldShowXPromo(state)) {
    return null;
  }
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
  ], feature => featureContext.enabled(feature));
  return featureFlag ? EXPERIMENT_NAMES[featureFlag] : null;
}

export function interstitialType(state) {
  if (loginRequiredEnabled(state)) {
    return 'require_login';
  }
  return 'transparent';
}

export function isPartOfXPromoExperiment(state) {
  return !!loginExperimentName(state);
}

export function currentExperimentData(state) {
  const experimentName = loginExperimentName(state);
  return getExperimentData(state, experimentName);
}

import { some } from 'lodash/collection';

import { flags as flagConstants } from 'app/constants';
import featureFlags from 'app/featureFlags';


const {
  SMARTBANNER,
  VARIANT_XPROMO_BASE,
  VARIANT_XPROMO_LIST,
  VARIANT_XPROMO_RATING,
  VARIANT_XPROMO_LISTING,
  VARIANT_XPROMO_SUBREDDIT,
  VARIANT_XPROMO_CLICK,
} = flagConstants;


export function crossPromoSelector(state) {
  const features = featureFlags.withContext({ state });

  const showBanner = state.smartBanner.showBanner;
  const showInterstitial = showBanner &&
                           some([
                             VARIANT_XPROMO_BASE,
                             VARIANT_XPROMO_LIST,
                             VARIANT_XPROMO_RATING,
                             VARIANT_XPROMO_LISTING,
                           ], variant => features.enabled(variant));
  const showInterstitialListing = showBanner &&
                                  some([
                                    VARIANT_XPROMO_SUBREDDIT,
                                  ], variant => features.enabled(variant));
  const showSmartBanner = !showInterstitial && !showInterstitialListing && showBanner
                       && !features.enabled(VARIANT_XPROMO_CLICK)
                       && features.enabled(SMARTBANNER);

  return {
    showInterstitial,
    showInterstitialListing,
    showSmartBanner,
  };
}

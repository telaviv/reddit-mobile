import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import SmartBanner from 'app/components/SmartBanner';
import InterstitialPromo from 'app/components/InterstitialPromo';
import InterstitialListing from 'app/components/InterstitialListing';
import EUCookieNotice from 'app/components/EUCookieNotice';
import TopNav from 'app/components/TopNav';
import { crossPromoSelector } from 'app/selectors/crossPromoSelector';

const NavFrame = props => {
  const {
    showInterstitial,
    showInterstitialListing,
    showSmartBanner,
  } = props;

  return (
    <div className='NavFrame'>
      { showInterstitial ? <InterstitialPromo /> : null }
      { showInterstitialListing ? <InterstitialListing /> : null }
      <TopNav />
      <div className='NavFrame__below-top-nav'>
        <EUCookieNotice />
        { props.children }
      </div>
      { showSmartBanner ? <SmartBanner /> : null }
    </div>
  );
};

export default connect(crossPromoSelector)(NavFrame);

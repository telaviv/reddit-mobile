import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import TopNav from 'app/components/TopNav';
import CompactSubreddit from 'app/components/CompactSubreddit';
import ThumbnailGrid from 'app/components/ThumbnailGrid';
import IPhoneAppPreview from 'app/components/IPhoneAppPreview';
import { interstitialExperimentSelector } from 'app/selectors/interstitialExperiment';


const TransparentOverlay = props => {
  return (
    <div className='TransparentOverlay'>
      <div className='TransparentOverlay__overlay'></div>
      <div className='TransparentOverlay__childContainer'>
        <TopNav />
        { props.children }
      </div>
    </div>
  );
};

const DualPartInterstitialHeader = props => {
  const {
    showTransparency,
    showEmbeddedApp,
    showSubredditPosts,
    showStaticAppPreview,
    showSpeedAppPreview,
    showGifAppPreview,
    children,
  } = props;

  let innerContent, backgroundClass;

  if (showEmbeddedApp || showStaticAppPreview || showSubredditPosts ||
      showSpeedAppPreview || showGifAppPreview) {
    backgroundClass = 'colorful';
  } else {
    backgroundClass = 'plain';
  }

  if (showTransparency) {
    innerContent = (
      <TransparentOverlay>
        { children }
      </TransparentOverlay>
    );
  } else if (showEmbeddedApp) {
    innerContent = (
      <IPhoneAppPreview content='embedded'>
        { children }
      </IPhoneAppPreview>
    );
  } else if (showSubredditPosts) {
    innerContent = <CompactSubreddit />;
  } else if (showStaticAppPreview || showSpeedAppPreview) {
    innerContent = <IPhoneAppPreview content='static' />;
  } else if (showGifAppPreview) {
    innerContent = <IPhoneAppPreview content='gif' />;
  } else {
    innerContent = <ThumbnailGrid />;
  }

  return (
    <div className={ `DualPartInterstitialHeader ${backgroundClass}` }>
      { innerContent }
    </div>
  );
};

export default connect(interstitialExperimentSelector)(DualPartInterstitialHeader);

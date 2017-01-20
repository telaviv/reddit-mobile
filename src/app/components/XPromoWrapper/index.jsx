import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import * as smartBannerActions from 'app/actions/smartBanner';
import { markXPromoScrolledPast } from 'lib/smartBannerState';


const T = React.PropTypes;

class XPromoWrapper extends React.Component {
  static propTypes = {
    recordXPromoShown: T.func.isRequired,
  };

  componentDidMount() {
    // Indicate that we've displayed a crosspromotional UI, so we don't keep
    // showing them during this browsing session.
    this.props.recordXPromoShown();
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll() {
    // For now we will consider scrolling half the viewport
    // "scrolling past" the interstitial.
    // note the referencing of window
    if (window.pageYOffset > window.innerHeight / 2) {
      markXPromoScrolledPast();
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  render() {
    return this.props.children;
  }
}

const selector = createStructuredSelector({
  currentUrl: state => state.platform.currentPage.url,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  recordXPromoShown: () =>
    dispatchProps.dispatch(smartBannerActions.recordShown(stateProps.currentUrl)),
  ...ownProps,
});

export default connect(selector, undefined, mergeProps)(XPromoWrapper);

import './styles.less';

import React from 'react';

import config from 'config';

export default (props) => {
  // We currently support 3 "content" values.
  // static - a picture of cat
  // gif - a picture of a corgi getting tickled
  // embedded - we embed the the children prop to be inside of the iphone.
  const { children, content } = props;
  const { assetPath } = config;
  let innerContent;
  if (content === 'static') {
    innerContent = <img src={ `${assetPath}/img/cat-app-preview.png` }/>;
  } else if (content === 'gif') {
    innerContent = <img src={ `${assetPath}/img/corgi-app-preview.gif` }/>;
  } else { // content === 'embedded'
    innerContent = children;
  }

  return (
    <div className='IPhoneAppPreview'>
      <div className='IPhoneAppPreview__iphone'>
        <div className={ `IPhoneAppPreview__iphone__image ${content}` }>
          { innerContent }
        </div>
      </div>
    </div>
  );
};

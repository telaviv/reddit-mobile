import { createSelector } from 'reselect';

import { paramsToPostsListsId } from 'app/models/PostsList';
import PostsFromSubreddit from 'app/router/handlers/PostsFromSubreddit';
import getSubreddit from 'lib/getSubredditFromState';

const THUMBNAIL_THRESHOLD = 9;

export const thumbnailSelector = createSelector(
  getSubreddit,
  state => state.subreddits,
  state => state.postsLists,
  state => state.posts,
  state => state.modal,
  state => state.platform.currentPage,
  (
    subredditName,
    subreddits,
    postsLists,
    posts,
    modal,
    currentPage,
  ) => {
    let thumbnails;
    // let's make the asssumption that everything is over18 until we
    // see differently.
    let over18 = true;

    if (!subredditName) {
      // This is the case for the / and theoretically nothing else.
      over18 = false;

    } else {
      const subredditInfo = subreddits[subredditName.toLowerCase()];
      if (subredditInfo) {
        over18 = subredditInfo.over18;
      }
    }

    // For subreddit listings, we use the listing data we're already
    // grabbing and return the thumbnails if we have enough
    let hash = null;
    if (modal.type) {
      // In modal mode, we get the hash set at the time it's activated
      hash = modal.props ? modal.props.hash : null;
    } else {
      // Otherwise, we look at our current params to get the hash
      const { urlParams, queryParams } = currentPage;
      const getPageParams = PostsFromSubreddit.pageParamsToSubredditPostsParams;
      const pageParams = getPageParams({ urlParams, queryParams });
      hash = paramsToPostsListsId(pageParams);
    }
    const postsList = hash && postsLists[hash];
    if (postsList && !postsList.loading) {
      // We have posts!  Look for thumbails, stripping out nsfw, stickied, etc.
      const uuids = postsList.results.map(item => item.uuid);
      const allThumbs = uuids
        .filter(item => !(over18 || posts[item].over18))
        .filter(item => !posts[item].stickied)
        .map(item => posts[item].thumbnail)
        .filter(item => !!item && item.startsWith('http'));
      if (allThumbs.length >= THUMBNAIL_THRESHOLD) {
        // We have enough, so pass up the array
        thumbnails = allThumbs.slice(0, THUMBNAIL_THRESHOLD);
      } else {
        // 'null' means we know we don't have enough
        // 'undefined' (before we have posts) means we don't know yet
        thumbnails = null;
      }
    }

    return { thumbnails };
  },
);

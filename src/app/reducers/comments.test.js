import createTest from '@r/platform/createTest';
import { models } from '@r/api-client';
const { CommentModel } = models;

import comments from './comments';

import * as loginActions from 'app/actions/login';
import * as activitiesActions from 'app/actions/activities';
import * as commentActions from 'app/actions/comment';
import * as commentsPageActions from 'app/actions/commentsPage';
import * as postsListActions from 'app/actions/postsList';
import * as hiddenActions from 'app/actions/hidden';
import * as replyActions from 'app/actions/reply';
import * as savedActions from 'app/actions/saved';
import * as searchActions from 'app/actions/search';
import * as voteActions from 'app/actions/vote';
import * as mailActions from 'app/actions/mail';
import * as modToolActions from 'app/actions/modTools';

createTest({ reducers: { comments } }, ({ getStore, expect }) => {
  describe('comments', () => {
    describe('LOGGING_IN and LOGGED_OUT', () => {
      it('should return default on log out', () => {
        const { store } = getStore({
          comments: { t1_1: {} },
        });

        store.dispatch(loginActions.loggedOut());
        const { comments } = store.getState();
        expect(comments).to.eql({});
      });

      it('should return the default on log in', () => {
        const { store } = getStore({
          comments: { t1_1: {} },
        });

        store.dispatch(loginActions.loggingIn());
        const { comments } = store.getState();
        expect(comments).to.eql({});
      });
    });

    describe('receiving comments', () => {
      const COMMENT_SOURCE_ACTION_CREATORS = [
        activitiesActions.received,
        commentsPageActions.received,
        postsListActions.received,
        hiddenActions.received,
        savedActions.received,
        searchActions.received,
        mailActions.setInboxSuccess,
      ];

      it('should pull comments from all expected source actions', () => {
        COMMENT_SOURCE_ACTION_CREATORS.forEach((actionCreator) => {
          const COMMENT = {
            uuid: 't1_0001',
            selfText: 'here, have an upvote',
          };

          const { store } = getStore();
          store.dispatch(actionCreator('', {
            comments: {
              [COMMENT.uuid]: COMMENT,
            },
          }));

          const { comments } = store.getState();
          expect(comments).to.eql({
            [COMMENT.uuid]: COMMENT,
          });
        });
      });
    });

    describe('MORE_COMMENTS_RECEIVED', () => {
      it('should add new comments', () => {
        const PARENT_COMMENT_ID = '1';
        const INITIAL_COMMENTS = { [PARENT_COMMENT_ID]: {} };
        const COMMENTS = { '2': {}, '3': {} };

        const { store } = getStore({ comments: INITIAL_COMMENTS });

        store.dispatch(commentActions.received(PARENT_COMMENT_ID, COMMENTS));
        const { comments } = store.getState();
        expect(comments).to.eql({ ...INITIAL_COMMENTS, ...COMMENTS });
      });
    });

    describe('REPLIED', () => {
      // These tests use real comment models because we want to ensure
      // that replying adds to the replies field of other comments in the store.
      // Our models are immutable and this is done by calling `commentModel.set`,
      // which will generate a new model with the changes you give it, so we need
      // the real model in place for that.

      it('should add a new comment to the tree if there was a reply', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't1_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
        });

        const REPLY = CommentModel.fromJSON({
          parentId: COMMENT.uuid,
          name: 't1_2',
          id: '2',
          subreddit: COMMENT.subreddit,
          link_id: COMMENT.linkId,
          replies: [],
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(replyActions.success(REPLY.parentId, REPLY));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT.set({ replies: [ REPLY.toRecord() ] }),
          [REPLY.uuid]: REPLY,
        });
      });

      it('should not add replies to the wrong parent', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't1_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
        });

        const POST_REPLY = CommentModel.fromJSON({
          parentId: 't3_1',
          name: 't1_2',
          id: '2',
          subreddit: COMMENT.subreddit,
          link_id: COMMENT.linkId,
          replies: [],
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(replyActions.success(POST_REPLY.parentId, POST_REPLY));
        const { comments } = store.getState();

        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
          [POST_REPLY.uuid]: POST_REPLY,
        });
      });
    });

    describe('VOTED', () => {
      it('should update the score of a comment when you vote on it', () => {
        const COMMENT = {
          type: 'comment',
          uuid: 't1_1',
          subreddit: 'askreddit',
          score: 0,
          likes: 0,
        };

        const UPVOTED = {
          ...COMMENT,
          likes: 1,
          score: 1,
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(voteActions.success(UPVOTED.uuid, UPVOTED));
        const { comments } = store.getState();

        expect(comments).to.eql({
          [COMMENT.uuid]: UPVOTED,
        });
      });

      it('should not update the score of comments when a post is voted on', () => {
        const COMMENT = {
          uuid: 't1_1',
          subreddit: 'askreddit',
          score: 0,
          likes: 0,
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(voteActions.success('2', { type: 'post' }));
        const { comments } = store.getState();

        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
        });
      });
    });

    describe('SAVED', () => {
      it('should mark a post as saved', () => {
        const COMMENT = {
          uuid: 't1_1',
          saved: false,
        };

        const SAVED = {
          ...COMMENT,
          saved: true,
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(commentActions.saved(SAVED));
        const { comments } = store.getState();
        expect(comments).to.eql({
          [SAVED.uuid]: SAVED,
        });
      });

      it('should mark a post as un-saved', () => {
        const COMMENT = {
          uuid: 't1_1',
          saved: true,
        };

        const UNSAVED = {
          ...COMMENT,
          saved: false,
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(commentActions.saved(UNSAVED));
        const { comments } = store.getState();
        expect(comments).to.eql({
          [UNSAVED.uuid]: UNSAVED,
        });
      });
    });

    describe('DELETED', () => {
      it('should mark a comment as deleted', () => {
        const COMMENT = {
          uuid: 't1_1',
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
        };

        const DELETED = {
          ...COMMENT,
          author: '[deleted]',
          bodyHTML: '[deleted]',
        };

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(commentActions.deleted(DELETED));
        const { comments } = store.getState();
        expect(comments).to.eql({
          [DELETED.uuid]: DELETED,
        });
      });
    });

    describe('MODTOOLS_APPROVAL_SUCCESS', () => {
      it('should mark a comment as approved', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const APPROVED = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: true,
          removed: false,
          spam: false,
          approvedBy: 'foobar',
          bannedBy: null,
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(modToolActions.approvalSuccess(COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: APPROVED,
        });
      });

      it('should only update if thing.type is COMMENT', () => {
        const NOT_COMMENT = {
          type: 'BAD_TYPE',
        };

        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        // This should not do anything to the comment model
        store.dispatch(modToolActions.approvalSuccess(NOT_COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
        });

      });
    });

    describe('MODTOOLS_REMOVAL_SUCCESS', () => {
      it('should mark a comment as removed', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const REMOVED = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: false,
          removed: true,
          spam: false,
          approvedBy: null,
          bannedBy: 'foobar',
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(modToolActions.removalSuccess(false, COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: REMOVED,
        });
      });

      it('should mark a comment as spam', () => {
        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const SPAM = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: false,
          removed: false,
          spam: true,
          approvedBy: null,
          bannedBy: 'foobar',
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        store.dispatch(modToolActions.removalSuccess(true, COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: SPAM,
        });
      });

      it('should only update if thing.type is COMMENT', () => {
        const NOT_COMMENT = {
          type: 'BAD_TYPE',
        };

        const COMMENT = CommentModel.fromJSON({
          name: 't3_1',
          id: '1',
          subreddit: 'askreddit',
          link_id: '1',
          replies: [],
          author: 'nramadas',
          bodyHTML: 'nramadas is the best',
          approved: null,
          removed: null,
          spam: null,
          approvedBy: null,
          bannedBy: null,
          type: 'comment',
        });

        const { store } = getStore({
          comments: {
            [COMMENT.uuid]: COMMENT,
          },
        });

        // This should not do anything to the comment model
        store.dispatch(modToolActions.removalSuccess(NOT_COMMENT, 'foobar'));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT.uuid]: COMMENT,
        });
      });
    });

    describe('MODTOOLS_SET_STICKY_COMMENT_SUCCESS', () => {
      it('should mark a comment as sticky', () => {
        const COMMENT_UNSTICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: false,
        });

        const COMMENT_STICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: true,
        });

        const { store } = getStore({
          comments: {
            [COMMENT_UNSTICKIED.uuid]: COMMENT_UNSTICKIED,
          },
        });

        store.dispatch(modToolActions.setStickyCommentSuccess(COMMENT_UNSTICKIED, true));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT_UNSTICKIED.uuid]: COMMENT_STICKIED,
        });
      });

      it('should unmark a comment as sticky', () => {
        const COMMENT_UNSTICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: false,
        });

        const COMMENT_STICKIED = CommentModel.fromJSON({
          link_id: '1',
          name: 't1_1',
          stickied: true,
        });

        const { store } = getStore({
          comments: {
            [COMMENT_STICKIED.uuid]: COMMENT_STICKIED,
          },
        });

        store.dispatch(modToolActions.setStickyCommentSuccess(COMMENT_STICKIED, false));

        const { comments } = store.getState();
        expect(comments).to.eql({
          [COMMENT_STICKIED.uuid]: COMMENT_UNSTICKIED,
        });
      });
    });
  });
});

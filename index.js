const authentication = require('./authentication');
const uploadFilesCreate = require('./creates/upload_files.js');
const createBlogPost = require('./creates/create_blog_post.js');
const updateBlogState = require('./creates/update_blog_state.js');
const fetchFolders = require('./triggers/fetch_folders.js');
const createSocialPost = require('./creates/create_social_post.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  creates: { 
    [uploadFilesCreate.key]: uploadFilesCreate,
    [createBlogPost.key]: createBlogPost,
    [updateBlogState.key]: updateBlogState,
    [createSocialPost.key]: createSocialPost
  },
  triggers: { [fetchFolders.key]: fetchFolders },
};

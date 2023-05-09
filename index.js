const authentication = require('./authentication');
const uploadFilesCreate = require('./creates/upload_files.js');
const createBlogPost = require('./creates/create_blog_post.js');
const updateBlogState = require('./creates/update_blog_state.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  creates: { 
    [uploadFilesCreate.key]: uploadFilesCreate,
    [createBlogPost.key]: createBlogPost,
    [updateBlogState.key]: updateBlogState
  },
};

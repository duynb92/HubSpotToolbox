require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Create - update_blog_state', () => {
  zapier.tools.env.inject();

  it('should create an object', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
      },

      inputData: {
        blog_title: '[BLOG-10] - Testing Blog 6 May',
        state: 'SCHEDULED',
        publish_time: '2023-05-08T14:03:11.394Z'
      },
    };

    const result = await appTester(
      App.creates['update_blog_state'].operation.perform,
      bundle
    );
    result.should.not.be.an.Array();
  });
});

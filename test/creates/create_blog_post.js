require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Create - create_blog_post', () => {
  zapier.tools.env.inject();

  it('should create an object', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
      },

      inputData: {
        title: 'test updated',
        content: 'test content updated',
        blog_url: 'https://resources.agileops.vn/en/blog',
        author_email: 'test_author@email.com',
        author_name: 'test author name',
        meta_description: 'test meta description',
        language: 'en',
        slug: '/test-blog-from-zapier',
        tags: [
            { name: 'jsm' }, { name: 'jsw' }, { name: 'confluence'} , { name: 'agile' }
        ]
      },
    };

    const result = await appTester(
      App.creates['create_blog_post'].operation.perform,
      bundle
    );
    result.should.not.be.an.Array();
  });
});

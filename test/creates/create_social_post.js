require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Create - create_social_post', () => {
  zapier.tools.env.inject();

  it('should create an object', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
      },

      inputData: {
        content: 'Introducing our 5 Atlassian Certified #Experts at AgileOps. (tage their Linkedin profile Kiet, Duy, Phong, Sau, Phung)\n' +
        '\n' +
        "These brilliant minds have aced the toughest Atlassian certification exams to bring you unparalleled expertise in all things #Atlassian. From configuring #Jira to perfection to optimizing #Confluence for seamless collaboration, they've got you covered. So why settle for anything less when you can work with the best?\n" +
        '\n',
        publish_time: '2023-07-08T14:03:11.394Z',
        medias: [{
          url: 'https://images.unsplash.com/flagged/photo-1562503542-2a1e6f03b16b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0fHx8ZW58MHx8fHx8&w=1000&q=80'
        }],
        channels: [
          {
            type: 'FacebookPage',
            name: 'Tyche Corner Tea Express'
          }
        ]
      },
    };

    const result = await appTester(
      App.creates['create_social_post'].operation.perform,
      bundle
    );
    result.should.not.be.an.Array();
  });
});

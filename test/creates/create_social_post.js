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
        state: 'Draft',
        publish_time: null,
        medias: [
        {
          id: '119732677733',
          url: 'https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/test/test/pexels-pixabay-50577.jpg',
          file_type: 'IMG',
          width: 260,
          height: 280
        },
        {
          id: '119732677732',
          url: 'https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/test/test/panda1200-1.jpg',
          file_type: 'IMG',
          width: 1280,
          height: 853
        },
        {
          id: '119732677732',
          url: 'https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/test/test/panda1200-1.jpg',
          file_type: 'IMG',
          width: 1280,
          height: 853
        },
        {
          id: '119732677732',
          url: 'https://24400165.fs1.hubspotusercontent-na1.net/hubfs/24400165/test/test/panda1200-1.jpg',
          file_type: 'IMG',
          width: 1280,
          height: 853
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

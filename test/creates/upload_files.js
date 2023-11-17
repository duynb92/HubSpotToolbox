require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Create - upload_files', () => {
  zapier.tools.env.inject();

  it('should create an object', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
      },

      inputData: {
        parent_folder: 119674427830,
        folder: 'test',
        attachments: [
          {
            id: 'att159252607',
            name: 'pexels-pixabay-50577.jpg',
            file: 'https://www.shutterstock.com/image-illustration/cartoon-jpeg-illustration-cute-panda-260nw-58960402.jpg'
          },
          {
            id: 'att159711397',
            name: 'panda1200-1.jpg',
            file: 'https://cdn.pixabay.com/photo/2016/03/04/22/54/animal-1236875_1280.jpg'
          }
        ],
        should_return_url: true
      },
    };

    const result = await appTester(
      App.creates['upload_files'].operation.perform,
      bundle
    );
    result.should.not.be.an.Array();
  });
});

require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('Trigger - fetch_folders', () => {
  zapier.tools.env.inject();

  it('should return an array', async () => {
    const bundle = {
      authData: {
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
      },

      inputData: {
      },
    };

    const result = await appTester(
      App.triggers['fetch_folders'].operation.perform,
      bundle
    );
    result.should.be.an.Array();
  });
});

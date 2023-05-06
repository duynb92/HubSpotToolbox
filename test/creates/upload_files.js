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
        folder: 'test',
        attachments: [
          {
            id: 'att159252607',
            name: 'pexels-pixabay-50577.jpg',
            file: 'https://zapier-dev-files.s3.amazonaws.com/cli-platform/19476/iuZ_uj5RrX_4LEJ1PPsyIEVofGBk_C_01dHaEKmemSHOtx3cABZ352L-w1s4ZucyIXfh-yumxj9kFw9ZMmIrVEY5VwOXQAp43Be-maIS_CMpNqvqpx7x9NNIbH9Nsj7K-FP-raak2DsTEf6dNDrhkN88LXbweGkxpzSv1AOBeog'
          },
          {
            id: 'att159711397',
            name: 'panda1200-1.jpg',
            file: 'https://zapier-dev-files.s3.amazonaws.com/cli-platform/19476/-MzBDCgekrwcdNj7DfoUHkEewORVS8ipSS2qTDe5LqJIzCF5UqSc_-lti_ZLP0O1ZKgZ8oTrHCGnhrSUnifb8e8ZikRps-27kmcqmWXaHg1yN34jXC0wLLYP7qeme0GPyeNep05NS5BivUPKPo4rr1Pobd5vyQofwm1V2_zRMcA '
          }
        ]
      },
    };

    const result = await appTester(
      App.creates['upload_files'].operation.perform,
      bundle
    );
    result.should.not.be.an.Array();
  });
});

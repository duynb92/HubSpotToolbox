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
            file: 'https://zapier-dev-files.s3.amazonaws.com/cli-platform/19484/SzevU9sNvxqJrNa2jpVGOwMqRCnv-sPeNaIXc2DcdfCLRGai6PgBsvxr9sEnJIzqK9pO0zAU63Qs4TtaopUao6JPlN-S4tqYQ1RdWAThq77mHNBLaXijxp0GCziY4hG1wxc_fSaPiJSMVUn7Sl02oZDSqFeJErxFXoJ1-7xdj2I'
          },
          {
            id: 'att159711397',
            name: 'panda1200-1.jpg',
            file: 'https://zapier-dev-files.s3.amazonaws.com/cli-platform/19484/_fBhV5ABwAHac8QAoE4aLKLDnkgSc5HND2h_xGZkXXMpTAMzWdAFvrRl4Euk0I1xUE3tVHaqH-v2B67ELnG3_bqHJbNIqfGRezMErX-cB_X-eM5eJAAKMzynZWlZGYrWfGLkJmTYFrg0umYc0SbiyTCyJlAdVJ1HRnvVWCEfEDI'
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

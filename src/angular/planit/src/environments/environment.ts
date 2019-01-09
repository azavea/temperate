// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { commonEnvironment } from './environment.common';

export const environment = {
  ...commonEnvironment,

  production: false,
  // In development the Angular app is served by 'ng serve' so we need
  // an absolute URL for the Django application
  apiUrl: 'http://localhost:8100',
  heapID: '2972517413',
  googleMapsApiKey: 'AIzaSyCHvOjXWCRSTVRVMT_t6hBNOp_MFfif754',
};

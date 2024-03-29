import { commonEnvironment } from './environment.common';

export const environment = {
  ...commonEnvironment,

  production: true,
  // Relative URLs are used in production mode,
  // as both the Django app and the Angular app are on the same host
  apiUrl: '',
  heapID: '2827494035',
  googleMapsApiKey: 'AIzaSyDK6j5M8gn7f7aA22hZYOoucyfqwN95tz8',
};

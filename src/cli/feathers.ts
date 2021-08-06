// https://javascript.plainenglish.io/get-started-with-feathers-react-part-2-d071e29cb6a9

import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
// import auth from '@feathersjs/authentication-client';
import axios from 'axios';

const feathersClient = feathers();
// const restClient = rest(process.env.REACT_APP_API_URL) // https://create-react-app.dev/docs/adding-custom-environment-variables/
const restClient = rest('http://localhost:3030');

feathersClient.configure(restClient.axios(axios));
// feathersClient.configure(feathers.authentication());
// feathersClient.configure(auth({ storage: window.localStorage, storageKey: 'feathers-react-jwt' }));

export default feathersClient;

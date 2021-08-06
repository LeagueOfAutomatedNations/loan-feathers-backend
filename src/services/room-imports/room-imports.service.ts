// Initializes the `roomimports` service on path `/roomimports`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { RoomImports } from './room-imports.class';
import createModel from '../../models/room_imports.model';
import hooks from './room-imports.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    roomimports: RoomImports & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/roomimports', new RoomImports(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('roomimports');

  service.hooks(hooks);
}

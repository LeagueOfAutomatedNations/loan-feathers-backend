// Initializes the `alliance_invites` service on path `/alliance-invites`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { AllianceInvites } from './alliance_invites.class';
import createModel from '../../models/alliance_invites.model';
import hooks from './alliance_invites.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'alliance-invites': AllianceInvites & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/alliance-invites', new AllianceInvites(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('alliance-invites');

  service.hooks(hooks);
}

// Initializes the `ranking_imports` service on path `/ranking-imports`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { RankingImports } from './ranking_imports.class';
import createModel from '../../models/ranking_imports.model';
import hooks from './ranking_imports.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'ranking-imports': RankingImports & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/ranking-imports', new RankingImports(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('ranking-imports');

  service.hooks(hooks);
}

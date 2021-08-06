import { Sequelize } from 'sequelize';
import { Application } from './declarations';

export default function (app: Application): void {
  // TODO: make more flexible so it is not hardcoded to sqlite
  const { uri, options = {} } = app.get('database');
  const sequelize = new Sequelize(uri, {
    logging: false,
    define: {
      freezeTableName: true
    },
    ...options
  });
  const oldSetup = app.setup;

  app.set('sequelizeClient', sequelize);

  app.setup = function (...args): Application {
    const result = oldSetup.apply(this, args);

    // Set up data relationships
    const models = sequelize.models;
    Object.keys(models).forEach((name) => {
      if ('associate' in models[name]) {
        (models[name] as any).associate(models);
      }
    });

    // Sync to the database
    app.set('sequelizeSync', sequelize.sync());

    return result;
  };
}

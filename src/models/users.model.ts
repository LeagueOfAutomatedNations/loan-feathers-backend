// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const users = sequelizeClient.define(
    'users',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ingame_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      login_code: {
        type: DataTypes.STRING,
        allowNull: true
      },
      login_code_created_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      screeps_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
      alliance: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'alliances',
          key: 'id'
        }
      },
      gcl: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      power: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true;
        }
      }
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (users as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // users.belongsToMany(roomsModel, { foreignKey: 'owner'}); // this fails
  };

  return users;
}

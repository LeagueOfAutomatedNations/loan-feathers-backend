// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/lib/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const rooms = sequelizeClient.define('rooms', {
  
    shard: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeIndex'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeIndex'
    },
    import: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'compositeIndex'
    },
    level: {
      type: DataTypes.STRING,
      allowNull: true
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: true,
      // this fails to parse.
      references: {
        model: 'users',
        key: 'id'
      }
    },
    
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (rooms as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return rooms;
}

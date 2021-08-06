import { ScreepsAPI } from 'screeps-api';
import feathersClient from './feathers';
import axios from 'axios';

// todo, shardname as an argument?

async function run() {
  const api = await ScreepsAPI.fromConfig('main');
  const shardNames = new Set((await api.gameShardsInfo()).shards.map((s) => s.name));
  const room_import = await feathersClient.service('roomimports').create({
    status: 'in progress'
  });
  // shardNames.push('shardSeason');
  // TODO: this only gives us 10 users, guess we should repeat the call untill we have everything
  const users = await feathersClient.service('users').find();
  const dbUsers = users.reduce((a: any, x: any) => {
    a[x.screeps_id] = x;
    return a;
  }, {});

  for (const shardName of shardNames) {
    const roomsToInsert = [];
    const rooms = (await axios.get(`https://screepspl.us/data/${shardName}.roominfo.json`)).data as Record<
      string,
      {
        status: string;
        novice?: number;
        openTime?: number;
        own: { user: string; level: number };
        sign: { user: string; text: string; time: number; datetime: number };
      }
    >;
    for (const roomName in rooms) {
      const room = rooms[roomName];
      if (!room.own || !room.own.user) {
        continue;
      }
      const user = dbUsers[room.own.user];
      roomsToInsert.push({
        import: room_import.id,
        name: roomName,
        level: room.own.level,
        shard: shardName,
        owner: user.id
      });
    }
    console.log(`${shardName} inserted ${roomsToInsert.length} rooms`);
    await feathersClient.service('rooms').create(roomsToInsert);
  }

  room_import.status = 'complete';
  await feathersClient.service('roomimports').update(room_import.id, room_import);
}

run().catch(console.error);

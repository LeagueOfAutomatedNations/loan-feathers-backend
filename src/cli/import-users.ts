import { ScreepsAPI } from 'screeps-api';
import type { ServerResponse } from 'screeps-api';
import feathersClient from './feathers';
import axios from 'axios';

// https://screepspl.us/data/[shard].users.json

// https://screepspl.us/data/[shard].roommaps.json

async function run() {
  const api = await ScreepsAPI.fromConfig('main');
  const shardNames = new Set((await api.gameShardsInfo()).shards.map((s) => s.name));
  // shardNames.push('shardSeason');
  const users = await feathersClient.service('users').find();
  const dbUsers = new Set(users.map((u: any) => u.screeps_id));
  const usersToInsert = [];
  for (const shardName of shardNames) {
    const users = (await axios.get(`https://screepspl.us/data/${shardName}.users.json`)).data as {
      [index: string]: { username: string };
    };
    console.log(`${shardName} ${Object.keys(users).length} users`);
    for (const userId in users) {
      const user = users[userId];
      if (!dbUsers.has(userId)) {
        usersToInsert.push({ ingame_name: user.username, screeps_id: userId });
      }
    }
  }
  console.log(`inserted ${usersToInsert.length} users`);
  await feathersClient.service('users').create(usersToInsert);
}

run().catch(console.error);

// const roomRegex = new RegExp(/(E|W)(\d+)(N|S)(\d+)/);

// const queueLimit = 15000;

// const getRoomData = (roomName: string): { x_dir: 'E' | 'W'; x: number; y_dir: 'N' | 'S'; y: number } => {
//   const match = roomName.match(roomRegex);

//   if (!match) {
//     throw new Error(`Could not extract data from ${roomName}`);
//   }
//   // data = {}
//   // data['x_dir'] = match.group(1)
//   // data['x'] = int(match.group(2))
//   // data['y_dir'] = match.group(3)
//   // data['y'] = int(match.group(4))
//   const result = {
//     x_dir: match[1] as 'E' | 'W',
//     x: parseInt(match[2]),
//     y_dir: match[3] as 'N' | 'S',
//     y: parseInt(match[4])
//   };

//   return result;
// };

// const isNPC = (roomName: string): boolean => {
//   const { x, y } = getRoomData(roomName);
//   if (x === 0 || y === 0) {
//     return true;
//   }

//   if (x % 10 === 0) {
//     return true;
//   }

//   if (y % 10 === 0) {
//     return true;
//   }
//   if (x % 5 == 0 && y % 5 == 0) {
//     return true;
//   }

//   if (x % 10 <= 3 || x % 10 >= 7) {
//     return false;
//   }

//   if (y % 10 <= 3 || y % 10 >= 7) {
//     return false;
//   }

//   return true;
// };

// type WorldSizeResponse = ServerResponse & {
//   width: number;
//   height: number;
// };

// // https://github.com/feathersjs/docs/issues/1514

// (async function main() {
//   const api = await ScreepsAPI.fromConfig('main');
//   console.log('Screeps API acquired');
//   // TODO: query = "INSERT INTO room_imports(status) VALUES ('in progress') RETURNING id"
//   const room_import = await feathersClient.service('roomimports').create({
//     started_at: new Date(),
//     status: 'in progress'
//   });
//   try {
//     console.log('Getting shards');
//     const { ok, shards } = await api.gameShardsInfo();
//     for (const shard of shards) {
//       console.log(`Processing ${shard.name}`);
//       room_import.status = 'in progress: ' + shard.name;
//       await feathersClient.service('roomimports').update(room_import.id, room_import);

//       let queue: string[] = [];
//       const user_map: { [index: string]: string } = {};

//       const worldSize = (await api.gameWorldSize(shard.name)) as WorldSizeResponse;
//       console.log(`${shard.name} worldSize:${JSON.stringify(worldSize)}`);
//       const maxroom = (worldSize.width - 2) / 2;
//       for (let x = 1; x < maxroom + 1; x++) {
//         for (let y = 1; y < maxroom + 1; y++) {
//           for (const horizontal of ['E', 'W']) {
//             for (const vertical of ['N', 'S']) {
//               const roomName = `${horizontal}${x}${vertical}${y}`;
//               console.log(roomName);
//               if (isNPC(roomName)) {
//                 continue;
//               }

//               queue.push(roomName);

//               if (queue.length < queueLimit) {
//                 if (y < maxroom || x < maxroom) {
//                   continue;
//                 }
//               }

//               const room_statistics = await api.gameMapStats(queue, 'claim0', shard.name);
//               // roomCount += queueLimit; // huh? queuelimit?
//               console.log(`${queue.length} rooms requested`);

//               queue = [];

//               let userCount = 0;
//               for (const userId in room_statistics.users) {
//                 const userInfo = room_statistics.users[userId];
//                 user_map[userId] = userInfo.username;
//                 userCount++;
//               }

//               console.log(`${userCount} users found`);

//               let roomCount = 0;
//               for (const roomName in room_statistics.stats) {
//                 roomCount++;
//                 const stats = room_statistics.stats[roomName];
//                 if (stats.own && stats.own.user) {
//                   const screeps_id = stats.own.user;
//                   const level = stats.own.level;
//                   const result = await feathersClient.service('users').find({ query: { screeps_id: screeps_id } });
//                   let user = result.data[0];
//                   if (!user) {
//                     const username = user_map[screeps_id];
//                     user = await feathersClient.service('users').create({ ingame_name: username, screeps_id });
//                   }

//                   await feathersClient.service('rooms').create({
//                     import: room_import.id,
//                     name: roomName,
//                     level,
//                     shard: shard.name,
//                     owner: user.id
//                   });
//                 }
//               }
//               console.log(`${roomCount} rooms processed`);
//             }
//           }
//         }
//       }
//       console.log(`finished processing ${shard.name}`);
//     }

//     //TODO: query = "UPDATE room_imports SET status='complete' WHERE id=(%s)"
//     room_import.status = 'complete';
//     await feathersClient.service('roomimports').update(room_import.id, room_import);
//   } catch (error) {
//     console.log(error);
//     room_import.status = 'error';
//     await feathersClient.service('roomimports').update(room_import.id, room_import);
//   }

//   console.log('import finished');
// })();

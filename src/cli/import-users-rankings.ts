import { ScreepsAPI, UserFindResponse, UserInfo } from 'screeps-api';
import type { ServerResponse } from 'screeps-api';
import feathersClient from './feathers';
import axios from 'axios';

// https://screepspl.us/data/[shard].users.json

// https://screepspl.us/data/[shard].roommaps.json

type FixedUserInfo = UserInfo & { power?: number };
type FixedUserFindResponse = UserFindResponse & { user: FixedUserInfo };

async function run() {
  const api = await ScreepsAPI.fromConfig('main');
  const users = await feathersClient.service('users').find();
  // query = "SELECT * FROM users ORDER BY gcl IS NOT NULL, RANDOM()"
  // TODO: sort users to prioritise getting info for users without gcl
  console.log(`fetching gcl & power for ${users.length} users`);
  let ps = [];
  let updatedUsers = 0;
  for (const user of users) {
    ps.push(
      api.userFind(user.ingame_name).then(async (result: FixedUserFindResponse) => {
        user.gcl = result.user.gcl;
        user.power = result.user.power;
        await feathersClient.service('users').update(user.id, user);
      })
    );

    if (ps.length < 30) {
      continue;
    }

    await Promise.all(ps);
    updatedUsers += ps.length;

    const progress = (updatedUsers / users.length) * 100;
    process.stdout.cursorTo(0);
    process.stdout.write(`${progress.toFixed(2)}% ${updatedUsers}/${users.length} users`);
    process.stdout.write('\nwaiting 15s');

    ps = [];
    await sleep(15000);
    process.stdout.clearLine(0); // clear the entire line
    process.stdout.moveCursor(0, -1); // move up to update progress
  }

  console.log(`updated ${users.length} users`);
}

run().catch((error) => {
  // console.error(error);
  throw error;
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

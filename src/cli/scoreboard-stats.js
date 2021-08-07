const { ScreepsAPI } = require('screeps-api');
const axios = require('axios');
const fs = require('fs').promises;

// const playerCount = 138

async function run() {
  const api = await ScreepsAPI.fromConfig('seasonal', 'seasonal');
  api.opts.experimentalRetry429 = true;
  const users = [];
  console.log('Getting List...');
  const {
    meta: { length: playerCount }
  } = await api.raw.scoreboard.list(0);
  const reqCnt = Math.ceil(playerCount / 20);
  const { time: gametime } = await api.raw.game.time('shardSeason');
  const {
    shards: [shardInfo]
  } = await api.raw.game.shards.info();
  const ps = [];
  console.log(`${reqCnt} requests needed`);
  for (let i = 0; i < reqCnt; i++) {
    ps.push(api.raw.scoreboard.list(20, i * 20));
  }
  const userMap = {};
  const scoreResponses = await Promise.all(ps);
  for (const res of scoreResponses) {
    for (const { _id, score, rank, username } of res.users) {
      if (!username) continue;
      userMap[username] = userMap[username] || {};
      Object.assign(userMap[username], {
        _id,
        username,
        score,
        rank
      });
    }
  }
  ps.splice(0, 1e5);
  const {
    seasons: [{ _id: season }]
  } = await api.raw.leaderboard.seasons();
  console.log(`Getting leaderboards for season ${season}`);
  for (let i = 0; i < reqCnt; i++) {
    ps.push(api.raw.leaderboard.list(20, 'world', i * 20, season));
  }
  const leadWorldResponses = await Promise.all(ps);
  for (const res of leadWorldResponses) {
    for (const [, { _id, username, gcl }] of Object.entries(res.users)) {
      if (!username) continue;
      userMap[username] = userMap[username] || {};
      Object.assign(userMap[username], {
        _id,
        username,
        gcl
      });
    }
  }

  const C = {
    GCL_POW: 2.4,
    GCL_MULTIPLY: 1000000,
    POWER_LEVEL_MULTIPLY: 1000,
    POWER_LEVEL_POW: 2
  };
  ps.splice(0, 1e5);
  for (let i = 0; i < reqCnt; i++) {
    ps.push(api.raw.leaderboard.list(20, 'power', i * 20, season));
  }
  const leadPowerResponses = await Promise.all(ps);
  for (const res of leadPowerResponses) {
    for (const [, { _id, username, gcl }] of Object.entries(res.users)) {
      if (!username) continue;
      userMap[username] = userMap[username] || {};
      Object.assign(userMap[username], {
        _id,
        username,
        gcl
      });
    }
    for (const { rank, score, user } of res.list) {
      const username = res.users[user].username;
      if (!username) continue;
      userMap[username].power = score;
    }
  }
  for (const [, user] of Object.entries(userMap)) {
    const gclLevel = Math.floor(Math.pow((user.gcl || 0) / C.GCL_MULTIPLY, 1 / C.GCL_POW)) + 1;
    const powerLevel = Math.floor(Math.pow((user.power || 0) / C.POWER_LEVEL_MULTIPLY, 1 / C.POWER_LEVEL_POW));
    Object.assign(user, {
      rooms: 0,
      creeps: 0,
      combinedRCL: 0,
      gclLevel,
      powerLevel,
      rcl: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
    });
  }
  console.log('Getting Room Objects');
  const { objects, users: oUsers } = await api.req(
    'GET',
    'https://screeps.com/season/api/game/room-objects?shard=shardSeason&room[$exists]=true'
  );
  console.log(`Iterating ${objects.length} objects`);
  let creeps = 0;
  for (const o of objects) {
    const { username } = oUsers[o.user] || {};
    const user = userMap[username];
    if (!user) continue;
    if (o.type === 'creep') {
      creeps++;
      user.creeps++;
    }
    if (o.type === 'controller') {
      if (user) {
        user.rooms++;
        user.combinedRCL += o.level;
        user.rcl[o.level]++;
      }
    }
  }
  console.log(`Got scoreboard with ${playerCount} users`);
  const stats = {
    objects: {
      all: objects.length,
      creeps
    },
    totalRooms: shardInfo.rooms,
    activeRooms: shardInfo.rooms,
    activeUsers: shardInfo.users,
    ticks: {
      avg: shardInfo.tick,
      ticks: shardInfo.lastTicks
    },
    gametime,
    users: userMap
  };
  stats.users = Object.entries(stats.users).reduce((ret, [, u]) => {
    ret[u.username.toLowerCase()] = u;
    return ret;
  }, {});

  for (const [, user] of Object.entries(stats.users)) {
    delete user._id;
    delete user.username;
  }
  axios({
    method: 'POST',
    url: 'https://screepspl.us/api/stats/submit',
    auth: {
      username: 'token',
      password: api.appConfig.statsToken
    },
    data: {
      servers: {
        shardseason: stats
      }
    }
  });
  fs.writeFile('stats.json', JSON.stringify(stats, null, 2)).catch(console.error);
}

run().catch(console.error);

import { Application } from '../declarations';
import users from './users/users.service';
import rooms from './rooms/rooms.service';
import roomimports from './room-imports/room-imports.service';
import alliances from './alliances/alliances.service';
import allianceInvites from './alliance-invites/alliance_invites.service';
import rankingImports from './ranking-imports/ranking_imports.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(rooms);
  app.configure(roomimports);
  app.configure(alliances);
  app.configure(allianceInvites);
  app.configure(rankingImports);
}

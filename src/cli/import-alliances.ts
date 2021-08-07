// @app.cli.command()
// def import_alliances():
//     click.echo("Start to import alliances from http://www.leagueofautomatednations.com/alliances.js")
//     import requests as r
//     import screeps_loan.models.alliances as alliances_model
//     import screeps_loan.models.users as users_model
//     import screeps_loan.auth_user
//     import screeps_loan.services.users as users_service

//     alliance_query = alliances_model.AllianceQuery()
//     users_query = users_model.UserQuery()
//     screeps = get_client()
//     auth_user = screeps_loan.auth_user.AuthPlayer(screeps)
//     resp = r.get('http://www.leagueofautomatednations.com/alliances.js')
//     data = json.loads(resp.text)
//     for shortname, info in data.items():
//         print(shortname)
//         members = info['members']
//         fullname = info['name']
//         color = None
//         if 'color' in info:
//             color = info['color']
//         slack = None
//         if 'slack' in info:
//             slack = info['slack']
//         alliance = alliance_query.find_by_shortname(shortname)
//         if (alliance is None):
//             alliance_query.insert_alliance(shortname, fullname, color, slack)
//             alliance = shortname

//         existing_member = [i['name'] for i in users_query.find_name_by_alliances([shortname])]
//         new_members = [name for name in members if name not in existing_member]
//         for member in new_members:
//             print(member)
//             id = users_service.player_id_from_api(member)
//             users_query.update_alliance_by_screeps_id(id, shortname)

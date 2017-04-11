import {createDefaultAppState, getDefaultTeams, logServer} from "./utils";
import {Store} from "./Store";


export function initRedisStore(callback): Store {
    const redis = require("redis");
    const portArg = process.env.REDIS_URL;
    const client = portArg ? redis.createClient(portArg) : redis.createClient();

    client.on("error", function (err) {
        logServer('Error start redis listener ' + err);
    });

    logServer('Start redis client');

    const TEAMS_KEY = "teams";
    const APP_STATE_KEY = "app_state";
    const TEAMS_CACHE: Team[] = [];
    const DEFAULT_STATES: { [token: string]: AppState } = {};

    const initTeams = () => {
        const multi = client.multi();

        multi.hgetall(TEAMS_KEY, function (err, object) {
            let count = 0;
            for (let l in object) {
                if (object.hasOwnProperty(l)) {
                    const value = object[l];
                    const items = JSON.parse(value);
                    if (items.firstLoginDate) {
                        const firstLoginDate: any = items.firstLoginDate;
                        const endDate: any = items.endQuestDate;
                        //fix date after serialization
                        items.firstLoginDate = new Date(firstLoginDate);
                        items.endQuestDate = new Date(endDate);
                    }
                    logServer('Load team ' + (count++) + ": " + items.name + ' token: ' + items.tokenId);

                    TEAMS_CACHE.push(items);
                }
            }
        });

        multi.hgetall(APP_STATE_KEY, function (err, object) {
            if (!object) {
                logServer('ERROR! No states');
            }
            let count = 0;
            for (let l in object) {
                if (object.hasOwnProperty(l)) {
                    const value = object[l];
                    DEFAULT_STATES[l] = JSON.parse(value);
                    logServer('Load state for team ' + (count++) + ': with token ' + l);
                }
            }
        });

        multi.exec(() => {
            callback();
        })
    };


    client.exists(TEAMS_KEY, function (err, reply) {
        logServer('Database ' + reply ? "initialized" : "empty");
        const defaultTeams = getDefaultTeams();

        const toPush = {};
        const multi = client.multi();
        for (let team of defaultTeams) {
            multi.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team));
            let value = createDefaultAppState(team);
            multi.hset(APP_STATE_KEY, team.tokenId, JSON.stringify(value));
            if (!reply) {
                TEAMS_CACHE.push(team);
                DEFAULT_STATES[team.tokenId] = value;
            }

            logServer('Update or store default team: ' + team.name + ' token: ' + team.secretCode)
        }

        multi.exec(() => {
            if (reply) {
                initTeams();
            } else {
                callback();
            }
        })
    });


    function saveTeamDB(team: Team, callback) {
        TEAMS_CACHE.push(team);
        client.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team), callback);
    }

    function saveAppDB(token: string, state: AppState, callback?: (res) => void) {
        client.hset(APP_STATE_KEY, token, JSON.stringify(state), callback);
    }


    function removeTeamDB(team: Team) {
        const index = TEAMS_CACHE.indexOf(team);
        if (index == -1) {
            return false;
        }

        TEAMS_CACHE.splice(index, 1);

        const multi = client.multi();
        multi.hdel(TEAMS_KEY, team.tokenId);
        multi.hdel(APP_STATE_KEY, team.tokenId);
        multi.exec(() => {
            logServer('ALERT: Removed team and state from database ' + team.name);
        });
    }


    return {
        removeTeamDB,
        saveTeamDB,
        saveAppDB,
        getTeams() {
            return TEAMS_CACHE;
        },
        getDefaultStates() {
            return DEFAULT_STATES;
        }
    }
}



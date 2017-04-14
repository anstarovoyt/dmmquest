"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function initRedisStore(callback) {
    var redis = require("redis");
    var portArg = process.env.REDIS_URL;
    var client = portArg ? redis.createClient(portArg) : redis.createClient();
    client.on("error", function (err) {
        utils_1.logServer('Error start redis listener ' + err);
    });
    utils_1.logServer('Start redis client');
    var TEAMS_KEY = "teams";
    var APP_STATE_KEY = "app_state";
    var TEAMS_CACHE = [];
    // noinspection JSMismatchedCollectionQueryUpdate
    var DEFAULT_STATES = {};
    var initTeams = function () {
        var multi = client.multi();
        multi.hgetall(TEAMS_KEY, function (err, object) {
            var count = 0;
            for (var l in object) {
                if (object.hasOwnProperty(l)) {
                    var value = object[l];
                    var items = JSON.parse(value);
                    if (items.firstLoginDate) {
                        var firstLoginDate = items.firstLoginDate;
                        var endDate = items.endQuestDate;
                        //fix date after serialization
                        items.firstLoginDate = new Date(firstLoginDate);
                        items.endQuestDate = new Date(endDate);
                    }
                    utils_1.logServer('Load team ' + (count++) + ": " + items.name + ' token: ' + items.tokenId);
                    TEAMS_CACHE.push(items);
                }
            }
        });
        multi.hgetall(APP_STATE_KEY, function (err, object) {
            if (!object) {
                utils_1.logServer('ERROR! No states');
            }
            var count = 0;
            for (var l in object) {
                if (object.hasOwnProperty(l)) {
                    var value = object[l];
                    DEFAULT_STATES[l] = JSON.parse(value);
                    utils_1.logServer('Load state for team ' + (count++) + ': with token ' + l);
                }
            }
        });
        multi.exec(function () {
            callback();
        });
    };
    client.exists(TEAMS_KEY, function (err, reply) {
        utils_1.logServer('Database ' + reply ? "initialized" : "empty");
        var defaultTeams = utils_1.getDefaultTeams();
        var toPush = {};
        var multi = client.multi();
        for (var _i = 0, defaultTeams_1 = defaultTeams; _i < defaultTeams_1.length; _i++) {
            var team = defaultTeams_1[_i];
            multi.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team));
            var value = utils_1.createDefaultAppState(team);
            multi.hset(APP_STATE_KEY, team.tokenId, JSON.stringify(value));
            if (!reply) {
                TEAMS_CACHE.push(team);
                DEFAULT_STATES[team.tokenId] = value;
            }
            utils_1.logServer('Update or store default team: ' + team.name + ' token: ' + team.secretCode);
        }
        multi.exec(function () {
            if (reply) {
                initTeams();
            }
            else {
                callback();
            }
        });
    });
    function saveTeamDB(team, callback) {
        TEAMS_CACHE.push(team);
        client.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team), callback);
    }
    function saveAppDB(token, state, callback) {
        client.hset(APP_STATE_KEY, token, JSON.stringify(state), callback);
    }
    function removeTeamDB(team) {
        var index = TEAMS_CACHE.indexOf(team);
        if (index == -1) {
            return false;
        }
        TEAMS_CACHE.splice(index, 1);
        var multi = client.multi();
        multi.hdel(TEAMS_KEY, team.tokenId);
        multi.hdel(APP_STATE_KEY, team.tokenId);
        multi.exec(function () {
            utils_1.logServer('ALERT: Removed team and state from database ' + team.name);
        });
    }
    return {
        removeTeamDB: removeTeamDB,
        saveTeamDB: saveTeamDB,
        saveAppDB: saveAppDB,
        getTeams: function () {
            return TEAMS_CACHE;
        },
        getDefaultStates: function () {
            return DEFAULT_STATES;
        }
    };
}
exports.initRedisStore = initRedisStore;
//# sourceMappingURL=RedisClient.js.map
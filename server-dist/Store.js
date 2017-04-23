"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RedisClient_1 = require("./RedisClient");
var utils_1 = require("./utils");
function initStore(callback) {
    if (process.env.REDIS_URL) {
        utils_1.logServer('Run service with redis');
        return RedisClient_1.initRedisStore(callback);
    }
    setImmediate(function () {
        utils_1.logServer('Run local service');
        callback();
    });
    var defaultTeams = utils_1.getDefaultTeams();
    for (var _i = 0, defaultTeams_1 = defaultTeams; _i < defaultTeams_1.length; _i++) {
        var obj = defaultTeams_1[_i];
        utils_1.logServer(obj.name);
    }
    return {
        saveTeamDB: function (team, callback) {
            defaultTeams.push(team);
            if (callback) {
                callback();
            }
        },
        saveAppDB: function (token, state, callback) {
        },
        removeTeamDB: function (team) {
        },
        getTeams: function () {
            return defaultTeams;
        },
        getDefaultStates: function () {
            var result = {};
            for (var _i = 0, _a = this.getTeams(); _i < _a.length; _i++) {
                var obj = _a[_i];
                result[obj.tokenId] = utils_1.createDefaultAppState(obj);
            }
            return result;
        }
    };
}
exports.initStore = initStore;
//# sourceMappingURL=Store.js.map
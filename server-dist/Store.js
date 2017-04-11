"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RedisClient_1 = require("./RedisClient");
var utils_1 = require("./utils");
function initStore(callback) {
    if (process.env.REDIS_URL) {
        return RedisClient_1.initRedisStore(callback);
    }
    setImmediate(function () { return callback(); });
    return {
        saveTeamDB: function (team, callback) {
        },
        saveAppDB: function (token, state, callback) {
        },
        removeTeamDB: function (team) {
        },
        getTeams: function () {
            return utils_1.getDefaultTeams();
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
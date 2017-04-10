"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RedisClient_1 = require("./RedisClient");
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
            return [];
        },
        getDefaultStates: function () {
            return {};
        }
    };
}
exports.initStore = initStore;
//# sourceMappingURL=Store.js.map
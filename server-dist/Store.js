"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function initStore(callback) {
    if (process.env.REDIS_URL) {
    }
    return {
        saveTeamDB: function (team, callback) {
        },
        saveAppDB: function (token, state, callback) {
        },
        removeTeamDB: function (team) {
        }
    };
}
exports.initStore = initStore;
//# sourceMappingURL=Store.js.map
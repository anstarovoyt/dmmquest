"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function initStore(callback) {
    setImmediate(function () {
        utils_1.logServer("Run local service");
        callback();
    });
    var defaultTeams = utils_1.getDefaultTeams();
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var StateManager = (function () {
    function StateManager(dbStore) {
        this.dbStore = dbStore;
        this.states = dbStore.getDefaultStates();
    }
    StateManager.prototype.getState = function (token) {
        return this.states[token];
    };
    StateManager.prototype.initDefaultStateObject = function (team) {
        var defaultAppState = utils_1.createDefaultAppState(team);
        this.states[team.tokenId] = defaultAppState;
        return defaultAppState;
    };
    StateManager.prototype.saveAppDB = function (token, state, callback) {
        this.dbStore.saveAppDB(token, state, callback);
    };
    return StateManager;
}());
exports.StateManager = StateManager;
//# sourceMappingURL=StateManager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StageManager_1 = require("./StageManager");
var server_1 = require("./server");
var data_1 = require("./data");
var utils_1 = require("./utils");
var redis = require("redis");
var portArg = process.env.REDIS_URL;
exports.client = portArg ? redis.createClient(portArg) : redis.createClient();
exports.client.on("error", function (err) {
    utils_1.logServer('Error start redis listener');
});
utils_1.logServer('Start redis client');
exports.TEAMS_KEY = "teams";
exports.APP_STATE_KEY = "app_state";
exports.TEAMS_CACHE = [];
var initTeams = function () {
    var multi = exports.client.multi();
    multi.hgetall(exports.TEAMS_KEY, function (err, object) {
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
                exports.TEAMS_CACHE.push(items);
            }
        }
    });
    multi.hgetall(exports.APP_STATE_KEY, function (err, object) {
        if (!object) {
            utils_1.logServer('ERROR! No states');
        }
        var count = 0;
        for (var l in object) {
            if (object.hasOwnProperty(l)) {
                var value = object[l];
                StageManager_1.stageManager.states[l] = JSON.parse(value);
                utils_1.logServer('Load state for team ' + (count++) + ': with token ' + l);
            }
        }
    });
    multi.exec(function () {
        server_1.initServer();
    });
};
exports.client.exists(exports.TEAMS_KEY, function (err, reply) {
    utils_1.logServer('Database ' + reply ? "initialized" : "empty");
    var defaultTeams = getDefaultTeams();
    var toPush = {};
    var multi = exports.client.multi();
    for (var _i = 0, defaultTeams_1 = defaultTeams; _i < defaultTeams_1.length; _i++) {
        var team = defaultTeams_1[_i];
        multi.hset(exports.TEAMS_KEY, team.tokenId, JSON.stringify(team));
        multi.hset(exports.APP_STATE_KEY, team.tokenId, JSON.stringify(initDefaultStateObject(team)));
        if (!reply) {
            exports.TEAMS_CACHE.push(team);
        }
        utils_1.logServer('Update or store default team: ' + team.name + ' token: ' + team.secretCode);
    }
    multi.exec(function () {
        if (reply) {
            initTeams();
        }
        else {
            server_1.initServer();
        }
    });
});
function getDefaultTeams() {
    var teams = [];
    teams.push({
        name: "Тестовая админская команда",
        secretCode: "test+test-",
        tokenId: "test+test-",
        admin: true,
        startFromStage: 0
    });
    return teams;
}
function initDefaultStateObject(team) {
    var stages = [];
    var appState = {
        bonus: null,
        stages: stages
    };
    var defaultStages = data_1.defaultData.stages;
    var startFromStage = team.startFromStage;
    var pushNumber = 0;
    for (var i = startFromStage; i < defaultStages.length; i++) {
        var status_1 = i == startFromStage ? 1 /* OPEN */ : 0 /* LOCKED */;
        stages.push({
            id: String(i),
            status: status_1,
            showNumber: pushNumber++
        });
    }
    for (var i = 0; i < startFromStage; i++) {
        var item = {
            id: String(i),
            status: 0 /* LOCKED */,
            showNumber: pushNumber++
        };
        stages.push(item);
    }
    stages[stages.length - 1].last = true;
    appState.bonus = {
        id: "bonus",
        status: 3 /* BONUS */,
        showNumber: pushNumber++
    };
    StageManager_1.stageManager.states[team.tokenId] = appState;
    return appState;
}
exports.initDefaultStateObject = initDefaultStateObject;
function saveTeamDB(team, callback) {
    exports.client.hset(exports.TEAMS_KEY, team.tokenId, JSON.stringify(team), callback);
}
exports.saveTeamDB = saveTeamDB;
function saveAppDB(token, state, callback) {
    exports.client.hset(exports.APP_STATE_KEY, token, JSON.stringify(state), callback);
}
exports.saveAppDB = saveAppDB;
function removeTeamDB(team) {
    var multi = exports.client.multi();
    multi.hdel(exports.TEAMS_KEY, team.tokenId);
    multi.hdel(exports.APP_STATE_KEY, team.tokenId);
    multi.exec(function () {
        utils_1.logServer('ALERT: Removed team and state from database ' + team.name);
    });
}
exports.removeTeamDB = removeTeamDB;
//# sourceMappingURL=RedisClient.js.map
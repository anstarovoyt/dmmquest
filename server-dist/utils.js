"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = require("./data");
var moment = require('moment');
function logServer(message) {
    console.log('DMM QUEST: ' + message);
}
exports.logServer = logServer;
function createDefaultAppState(team) {
    var stages = [];
    var appState = {
        bonus: null,
        killer: null,
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
        id: 'bonus',
        status: 3 /* BONUS */,
        showNumber: pushNumber++
    };
    appState.killer = {
        id: 'killer',
        status: 6 /* KILLER */,
        showNumber: pushNumber++
    };
    return appState;
}
exports.createDefaultAppState = createDefaultAppState;
function toEkbString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format('YYYY-MM-DD HH:mm');
}
exports.toEkbString = toEkbString;
function toEkbOnlyTimeString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format('HH:mm');
}
exports.toEkbOnlyTimeString = toEkbOnlyTimeString;
function getCloseDate(date) {
    return moment(date).add('hours', 2).add('minutes', '30').tz('Asia/Yekaterinburg').format('HH:mm');
}
exports.getCloseDate = getCloseDate;
function getDefaultTeams() {
    var teams = [];
    teams.push({
        name: 'Тестовая админская команда',
        secretCode: 'трувеганыедяттольконатуральноемясо',
        tokenId: 'трувеганыедяттольконатуральноемясо',
        admin: true,
        startFromStage: 0
    });
    return teams;
}
exports.getDefaultTeams = getDefaultTeams;
//# sourceMappingURL=utils.js.map
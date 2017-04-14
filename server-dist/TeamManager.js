"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = require("./data");
var utils_1 = require("./utils");
exports.COUNT_HOURS_TO_SOLVE = 7.5;
var TeamManager = (function () {
    function TeamManager(stageModifier, dbStore) {
        this.stageModifier = stageModifier;
        this.dbStore = dbStore;
    }
    TeamManager.prototype.findTeamByCode = function (secretCode) {
        if (!secretCode) {
            return null;
        }
        for (var _i = 0, _a = this.dbStore.getTeams(); _i < _a.length; _i++) {
            var team = _a[_i];
            if (team.secretCode.toLocaleLowerCase() == secretCode.toLocaleLowerCase()) {
                return team;
            }
        }
        return null;
    };
    TeamManager.prototype.findTeamByToken = function (tokenId) {
        for (var _i = 0, _a = this.dbStore.getTeams(); _i < _a.length; _i++) {
            var team = _a[_i];
            if (team.tokenId == tokenId) {
                return team;
            }
        }
        return null;
    };
    TeamManager.prototype.removeTeam = function (tokenId) {
        var team = this.findTeamByToken(tokenId);
        if (!team) {
            return false;
        }
        delete this.stageModifier.states[tokenId];
        utils_1.logServer('ALERT: Removed team from app ' + team.name + " token: " + team.tokenId);
        this.dbStore.removeTeamDB(team);
        return true;
    };
    TeamManager.prototype.createTeam = function (name) {
        var secretCode = TeamManager.makeid();
        var newStartFrom = this.getNextStartFromStage();
        var team = {
            name: name,
            secretCode: secretCode,
            tokenId: secretCode,
            startFromStage: newStartFrom
        };
        var token = team.tokenId;
        utils_1.logServer('Added team to app: ' + team.name + ' ' + team.secretCode);
        this.saveTeamToDB(team, function () {
            utils_1.logServer('Saved team to database: ' + team.name);
        });
        this.dbStore.saveAppDB(token, (this.getAppState(token)), function () {
            utils_1.logServer('Saved state to database: ' + team.name);
        });
        return team;
    };
    TeamManager.prototype.getAppState = function (token) {
        var state = this.stageModifier.getState(token);
        if (state) {
            return state;
        }
        return this.createAppState(token);
    };
    TeamManager.prototype.createAppState = function (token) {
        utils_1.logServer('Init state:' + token);
        var team = this.findTeamByToken(token);
        if (!team) {
            return;
        }
        return this.stageModifier.initDefaultStateObject(team);
    };
    TeamManager.prototype.listTeams = function () {
        return this.dbStore.getTeams();
    };
    TeamManager.prototype.login = function (secretCode) {
        var team = this.findTeamByCode(secretCode);
        if (team) {
            if (!team.firstLoginDate && !team.admin) {
                var date = new Date();
                var endDate = new Date(); //new object!
                endDate.setTime(date.getTime() + (exports.COUNT_HOURS_TO_SOLVE * 60 * 60 * 1000));
                team.endQuestDate = endDate;
                team.firstLoginDate = date;
                utils_1.logServer('First login for team: ' + team.name + ' token ' + team.tokenId + ' time: ' + utils_1.toEkbString(team.firstLoginDate));
                this.saveTeamToDB(team);
            }
            return {
                authenticated: true,
                name: team.name,
                token: team.tokenId,
                admin: team.admin
            };
        }
        utils_1.logServer('Incorrect login secret code access "' + secretCode + '"');
        return { authenticated: false };
    };
    TeamManager.prototype.getNextStartFromStage = function () {
        var teams = this.dbStore.getTeams();
        var lastTeam = teams[teams.length - 1];
        var startFromStage = lastTeam.startFromStage;
        var nextStage = startFromStage + 1;
        if (nextStage < data_1.defaultData.stages.length) {
            return nextStage;
        }
        return 0;
    };
    TeamManager.prototype.saveTeamToDB = function (team, callback) {
        this.dbStore.saveTeamDB(team, callback);
    };
    TeamManager.makeid = function () {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    return TeamManager;
}());
exports.TeamManager = TeamManager;
//# sourceMappingURL=TeamManager.js.map
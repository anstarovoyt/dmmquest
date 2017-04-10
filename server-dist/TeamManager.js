"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StageManager_1 = require("./StageManager");
var RedisClient_1 = require("./RedisClient");
var server_1 = require("./server");
var data_1 = require("./data");
exports.COUNT_HOURS_TO_SOLVE = 7;
var TeamManager = (function () {
    function TeamManager() {
    }
    TeamManager.prototype.findTeamByCode = function (secretCode) {
        if (!secretCode) {
            return null;
        }
        for (var _i = 0, TEAMS_CACHE_1 = RedisClient_1.TEAMS_CACHE; _i < TEAMS_CACHE_1.length; _i++) {
            var team = TEAMS_CACHE_1[_i];
            if (team.secretCode.toLocaleLowerCase() == secretCode.toLocaleLowerCase()) {
                return team;
            }
        }
        return null;
    };
    TeamManager.prototype.findTeamByToken = function (tokenId) {
        for (var _i = 0, TEAMS_CACHE_2 = RedisClient_1.TEAMS_CACHE; _i < TEAMS_CACHE_2.length; _i++) {
            var team = TEAMS_CACHE_2[_i];
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
        var index = RedisClient_1.TEAMS_CACHE.indexOf(team);
        if (index == -1) {
            return false;
        }
        RedisClient_1.TEAMS_CACHE.splice(index, 1);
        delete StageManager_1.stageManager.states[tokenId];
        RedisClient_1.log('ALERT: Removed team from app ' + team.name + " token: " + team.tokenId);
        var multi = RedisClient_1.client.multi();
        multi.hdel(RedisClient_1.TEAMS_KEY, team.tokenId);
        multi.hdel(RedisClient_1.APP_STATE_KEY, team.tokenId);
        multi.exec(function () {
            RedisClient_1.log('ALERT: Removed team and state from database ' + team.name);
        });
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
        RedisClient_1.TEAMS_CACHE.push(team);
        var token = team.tokenId;
        RedisClient_1.log('Added team to app: ' + team.name + ' ' + team.secretCode);
        this.saveTeamToDB(team, function () {
            RedisClient_1.log('Saved team to database: ' + team.name);
        });
        StageManager_1.stageManager.saveAppStateToDB(token, (StageManager_1.stageManager.getAppState(token)), function () {
            RedisClient_1.log('Saved state to database: ' + team.name);
        });
        return team;
    };
    TeamManager.prototype.listTeams = function () {
        return RedisClient_1.TEAMS_CACHE;
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
                RedisClient_1.log('First login for team: ' + team.name + ' token ' + team.tokenId + ' time: ' + server_1.toEkbString(team.firstLoginDate));
                this.saveTeamToDB(team);
            }
            return {
                authenticated: true,
                name: team.name,
                token: team.tokenId,
                admin: team.admin
            };
        }
        RedisClient_1.log('Incorrect login secret code access "' + secretCode + '"');
        return { authenticated: false };
    };
    TeamManager.prototype.getNextStartFromStage = function () {
        var lastTeam = RedisClient_1.TEAMS_CACHE[RedisClient_1.TEAMS_CACHE.length - 1];
        var startFromStage = lastTeam.startFromStage;
        var nextStage = startFromStage + 1;
        if (nextStage < data_1.defaultData.stages.length) {
            return nextStage;
        }
        return 0;
    };
    TeamManager.prototype.saveTeamToDB = function (team, callback) {
        RedisClient_1.client.hset(RedisClient_1.TEAMS_KEY, team.tokenId, JSON.stringify(team), callback);
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
exports.teamManager = new TeamManager();
//# sourceMappingURL=TeamManager.js.map
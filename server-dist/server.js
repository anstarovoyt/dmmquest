"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TeamManager_1 = require("./TeamManager");
var utils_1 = require("./utils");
var Store_1 = require("./Store");
var StageManager_1 = require("./StageManager");
var StateManager_1 = require("./StateManager");
var minimist = require('minimist');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment-timezone');
var PORT = process.env.PORT || 8080;
var TARGET_PATH_MAPPING = {
    BUILD: 'build',
    DIST: 'dist'
};
var dbStore = Store_1.initStore(initServer);
var startDir = path.dirname(__dirname);
utils_1.logServer(startDir);
var TARGET = minimist(process.argv.slice(2)).TARGET || 'BUILD';
function initServer() {
    utils_1.logServer("Start http server");
    var stateManager = new StateManager_1.StateManager(dbStore);
    var teamManager = new TeamManager_1.TeamManager(stateManager, dbStore);
    var stageManager = new StageManager_1.StageManager(teamManager, stateManager);
    utils_1.logServer('Start creating server, port ' + PORT);
    var server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    var appStatics = path.join(startDir, TARGET_PATH_MAPPING[TARGET]);
    utils_1.logServer("App: " + appStatics);
    var resources = path.join(startDir, 'statics');
    server
        .use(serveStatic(appStatics))
        .use('/statics', express.static(resources))
        .listen(PORT);
    server.post('/quest-texts', function (req, res, next) {
        var request = req.body;
        res.json(processQuestTextsRequest(request));
    });
    server.post('/state', function (req, res, next) {
        var request = req.body;
        res.json(processStateRequest(request));
    });
    server.post('/login', function (req, res, next) {
        var request = req.body;
        if (!request.secretCode) {
            res.json({
                authenticated: false
            });
            return;
        }
        res.json(processLoginRequest(request));
    });
    server.post('/save', function (req, res, next) {
        var request = req.body;
        res.json(processAnswerUpdateRequest(request, false));
    });
    //
    server.post('/complete', function (req, res, next) {
        var request = req.body;
        var token = request.token;
        var options = processAnswerUpdateRequest(request, true);
        if (!options.success) {
            res.json({
                success: false
            });
            return;
        }
        var result = stageManager.closeStage(token, request.stageId);
        var response = {
            res: result,
            success: true
        };
        res.json(response);
    });
    server.get('/stage/*', function (req, res, next) {
        res.sendFile(path.join(startDir, TARGET, '/index.html'));
    });
    server.get('/stages', function (req, res, next) {
        res.sendFile(path.join(startDir, TARGET, '/index.html'));
    });
    server.post('/teams', function (req, res, next) {
        var request = req.body;
        res.json(processGetTeamsRequest(request));
    });
    server.post('/remove-team', function (req, res, next) {
        var request = req.body;
        res.json(processRemoveTeamRequest(request));
    });
    server.post('/add-team', function (req, res, next) {
        var request = req.body;
        res.json(processAddTeamRequest(request));
    });
    server.post('/rest-time', function (req, res, next) {
        var request = req.body;
        res.json(getRestTime(request));
    });
    server.post('/unlock-stage', function (req, res, next) {
        var request = req.body;
        var team = checkToken(request.token);
        if (!team || !team.admin) {
            res.json({
                success: false
            });
        }
        res.json({
            success: stageManager.unlockLastStage(request.teamTokenId)
        });
    });
    server.post('/sign_s3', function (req, response, next) {
        var request = req.body;
        var team = checkToken(request.token);
        if (!team) {
            return;
        }
        processGetAWS(request, function (result) {
            console.log('aws req: ' + JSON.stringify(result));
            response.json(result);
        });
    });
    utils_1.logServer('Created server for: ' + TARGET + ', listening on port ' + PORT);
    function processStateRequest(req) {
        var token = req.token;
        var team = checkToken(token);
        if (!team) {
            utils_1.logServer('Internal error. No team for token ' + token);
            return { success: false };
        }
        return {
            success: true,
            state: {
                appState: teamManager.getAppState(token),
                stagesNames: stageManager.getStagesNames(),
                intro: stageManager.getIntro()
            }
        };
    }
    function processAnswerUpdateRequest(req, fromClose) {
        var token = req.token;
        var team = checkToken(token);
        if (!team) {
            return { success: false };
        }
        if (!checkTime(team)) {
            utils_1.logServer('Try to save answers "' + token + '" after complete ' + JSON.stringify(req.answers));
            return { success: false };
        }
        var answers = stageManager.setAnswers(token, req.stageId, req.answers, fromClose);
        return {
            success: !!answers,
            stage: answers
        };
    }
    function processLoginRequest(req) {
        return teamManager.login(req.secretCode);
    }
    function processQuestTextsRequest(request) {
        var token = request.token;
        var team = checkToken(token);
        if (!team) {
            return { success: false };
        }
        var stage = stageManager.getQuestionTexts(token, request.stageId);
        if (!stage) {
            return {
                success: false
            };
        }
        var quests = stage.quests;
        return {
            success: true,
            questTexts: {
                stageId: request.stageId,
                quests: quests.map(function (el, i) {
                    var text;
                    var type;
                    if (typeof el === "string") {
                        text = el;
                    }
                    else {
                        text = el.text;
                        type = el.type;
                    }
                    var result = {
                        id: i,
                        text: text
                    };
                    if (type) {
                        result.type = type;
                    }
                    return result;
                })
            }
        };
    }
    function processRemoveTeamRequest(request) {
        var token = request.token;
        var team = checkToken(token);
        if (!team || !team.admin) {
            return {
                success: false
            };
        }
        var result = teamManager.removeTeam(request.teamTokenId);
        return {
            success: result
        };
    }
    function processGetTeamsRequest(request) {
        var token = request.token;
        var team = checkToken(token);
        if (!team || !team.admin) {
            return {
                success: false
            };
        }
        var result = [];
        for (var _i = 0, _a = dbStore.getTeams(); _i < _a.length; _i++) {
            var cur = _a[_i];
            var teamSimple = {
                admin: cur.admin,
                name: cur.name,
                secretCode: cur.secretCode,
                startFromStage: cur.startFromStage,
                tokenId: cur.tokenId
            };
            var info = {
                team: cur,
                appState: teamManager.getAppState(cur.tokenId)
            };
            if (cur.firstLoginDate) {
                info.firstLoginDateEkbTimezone = utils_1.toEkbString(cur.firstLoginDate);
                info.endQuestEkbTimezone = utils_1.toEkbString(cur.endQuestDate);
            }
            result.push(info);
        }
        return {
            success: true,
            teams: result
        };
    }
    function processAddTeamRequest(request) {
        var team = teamManager.findTeamByToken(request.token);
        if (!team || !team.admin) {
            return {
                success: false
            };
        }
        var newTeam = teamManager.createTeam(request.teamName);
        return { success: !!newTeam };
    }
    function checkToken(token) {
        return teamManager.findTeamByCode(token);
    }
    function getRestTime(request) {
        var token = request.token;
        var team = checkToken(token);
        if (!team) {
            return {
                success: false
            };
        }
        if (!team.endQuestDate) {
            return {
                restTimeInSeconds: "-1",
                success: true
            };
        }
        var result = diffWithCurrentTime(team);
        return {
            success: true,
            restTimeInSeconds: String(result),
            isCompleted: result <= 0
        };
    }
    function checkTime(team) {
        if (!team.endQuestDate) {
            return true;
        }
        return diffWithCurrentTime(team) > 0;
    }
    function diffWithCurrentTime(team) {
        var currentTime = moment();
        var endTime = moment(team.endQuestDate);
        return endTime.diff(currentTime, 'seconds');
    }
}
exports.initServer = initServer;
//# sourceMappingURL=server.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StageManager_1 = require("./StageManager");
var TeamManager_1 = require("./TeamManager");
var RedisClient_1 = require("./RedisClient");
var minimist = require('minimist');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment-timezone');
var PORT = process.env.PORT || 8080;
var TARGET_PATH_MAPPING = {
    BUILD: './build',
    DIST: './dist'
};
var TARGET = minimist(process.argv.slice(2)).TARGET || 'BUILD';
function initServer() {
    RedisClient_1.log('Start creating server');
    var server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({
        extended: true
    }));
    server
        .use(serveStatic(TARGET_PATH_MAPPING[TARGET]))
        .use('/statics', express.static(__dirname + '/statics'))
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
        var result = StageManager_1.stageManager.closeStage(token, request.stageId);
        var response = {
            res: result,
            success: true
        };
        res.json(response);
    });
    server.get('/stage/*', function (req, res, next) {
        res.sendFile(path.join(__dirname, TARGET, '/index.html'));
    });
    server.get('/stages', function (req, res, next) {
        res.sendFile(path.join(__dirname, TARGET, '/index.html'));
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
            success: StageManager_1.stageManager.unlockLastStage(request.teamTokenId)
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
    RedisClient_1.log('Created server for: ' + TARGET + ', listening on port ' + PORT);
}
exports.initServer = initServer;
function processStateRequest(req) {
    var token = req.token;
    var team = checkToken(token);
    if (!team) {
        RedisClient_1.log('Internal error. No team for token ' + token);
        return { success: false };
    }
    return {
        success: true,
        state: {
            appState: StageManager_1.stageManager.getAppState(token),
            stagesNames: StageManager_1.stageManager.getStagesNames()
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
        RedisClient_1.log('Try to save answers "' + token + '" after complete ' + JSON.stringify(req.answers));
        return { success: false };
    }
    var answers = StageManager_1.stageManager.setAnswers(token, req.stageId, req.answers, fromClose);
    return {
        success: !!answers,
        stage: answers
    };
}
function processLoginRequest(req) {
    return TeamManager_1.teamManager.login(req.secretCode);
}
function processQuestTextsRequest(request) {
    var token = request.token;
    var team = checkToken(token);
    if (!team) {
        return { success: false };
    }
    var questTexts = StageManager_1.stageManager.getQuestionTexts(token, request.stageId);
    if (!questTexts) {
        return {
            success: false
        };
    }
    return {
        success: true,
        questTexts: {
            stageId: request.stageId,
            quests: questTexts.map(function (el, i) {
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
    var result = TeamManager_1.teamManager.removeTeam(request.teamTokenId);
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
    for (var _i = 0, TEAMS_CACHE_1 = RedisClient_1.TEAMS_CACHE; _i < TEAMS_CACHE_1.length; _i++) {
        var cur = TEAMS_CACHE_1[_i];
        var teamSimple = {
            admin: cur.admin,
            name: cur.name,
            secretCode: cur.secretCode,
            startFromStage: cur.startFromStage,
            tokenId: cur.tokenId
        };
        var info = {
            team: cur,
            appState: StageManager_1.stageManager.getAppState(cur.tokenId)
        };
        if (cur.firstLoginDate) {
            info.firstLoginDateEkbTimezone = toEkbString(cur.firstLoginDate);
            info.endQuestEkbTimezone = toEkbString(cur.endQuestDate);
        }
        result.push(info);
    }
    return {
        success: true,
        teams: result
    };
}
function processAddTeamRequest(request) {
    var team = TeamManager_1.teamManager.findTeamByToken(request.token);
    if (!team || !team.admin) {
        return {
            success: false
        };
    }
    var newTeam = TeamManager_1.teamManager.createTeam(request.teamName);
    return { success: !!newTeam };
}
function checkToken(token) {
    return TeamManager_1.teamManager.findTeamByCode(token);
}
exports.checkToken = checkToken;
function toEkbString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format("YYYY-MM-DD HH:mm");
}
exports.toEkbString = toEkbString;
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
//# sourceMappingURL=server.js.map
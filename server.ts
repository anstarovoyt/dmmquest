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
    log('Start creating server');
    var server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));


    server
        .use(serveStatic(TARGET_PATH_MAPPING[TARGET]))
        .use('/statics', express.static(__dirname + '/statics'))
        .listen(PORT);

    server.post('/quest-texts', (req, res, next) => {
        var request:QuestTextsRequest = req.body;

        res.json(processQuestTextsRequest(request));
    });

    server.post('/state', (req, res, next) => {
        var request:AppStateRequest = req.body;
        res.json(processStateRequest(request));
    });

    server.post('/login', (req, res, next) => {
        var request:LoginRequest = req.body;

        if (!request.secretCode) {
            res.json({
                authenticated: false
            });
            return;
        }

        console.log('login ' + request.secretCode);
        res.json(processLoginRequest(request));
    });

    server.post('/save', (req, res, next) => {
        var request:AnswersUpdateRequest = req.body;


        res.json(processAnswerUpdateRequest(request));
    });

    server.post('/complete', (req, res, next) => {
        var request:AnswersUpdateRequest = req.body;

        var token = request.token;
        var options = processAnswerUpdateRequest(request);
        if (!options.success) {
            res.json({
                success: false
            });
            return;
        }
        var result = stageManager.closeStage(token, request.stageId);
        var response:CompleteStageResponse = {
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
    })

    server.post('/teams', (req, res, next) => {
        var request:TeamsRequest = req.body;
        console.log(request);
        res.json(processGetTeamsRequest(request));
    });

    server.post('/remove-team', (req, res, next) => {
        var request:RemoveTeamRequest = req.body;
        console.log("Remove:" + request);
        res.json(processRemoveTeamRequest(request));
    });


    server.post('/add-team', (req, res, next) => {
        var request:AddTeamRequest = req.body;
        res.json(processAddTeamRequest(request));
    });

    server.post('/rest-time', (req, res, next) => {
        var request:GetRestTimeRequest = req.body;
        res.json(getRestTime(request));
    });


    log('Created server for: ' + TARGET + ', listening on port ' + PORT);
}


function processStateRequest(req:AppStateRequest):FullAppStateResponse {
    var token = req.token;
    var team = checkToken(token);
    if (!team) {
        console.log('no team found');
        return {success: false}
    }

    return {
        success: true,
        state: {
            appState: stageManager.getAppState(token),
            stagesNames: stageManager.getStagesNames()
        }
    }
}

function processAnswerUpdateRequest(req:AnswersUpdateRequest):AnswersUpdateResponse {
    var token = req.token;
    var team = checkToken(token);

    if (!team || !checkTime(team)) {
        return {success: false};
    }

    var answers = stageManager.setAnswers(token, req.stageId, req.answers);
    return {
        success: !!answers,
        stage: answers
    }
}

function processLoginRequest(req:LoginRequest):LoginInfo {
    return teamManager.login(req.secretCode);
}

function processQuestTextsRequest(request:QuestTextsRequest):QuestTextsResponse {
    var token = request.token;
    if (!checkToken(token)) {
        return {success: false};
    }

    var questTexts = stageManager.getQuestionTexts(token, request.stageId);
    if (!questTexts) {
        return {
            success: false
        }
    }

    return {
        success: true,

        questTexts: {
            stageId: request.stageId,
            quests: questTexts.map(function (el, i) {
                return {
                    id: i,
                    text: el
                }
            })
        }
    }
}

function processRemoveTeamRequest(request:RemoveTeamRequest):RemoveTeamResponse {
    var token = request.token;
    var team = checkToken(token);
    if (!team || !team.admin) {
        return {
            success: false
        }
    }

    var result = teamManager.removeTeam(request.teamTokenId);

    return {
        success: result
    }
}

function processGetTeamsRequest(request:TeamsRequest):TeamsResponse {
    var token = request.token;
    var team = checkToken(token);
    if (!team || !team.admin) {
        return {
            success: false
        }
    }

    var result:TeamInfo[] = [];

    for (var cur of TEAMS_CACHE) {
        var teamSimple:TeamSimple = {
            admin: cur.admin,
            name: cur.name,
            secretCode: cur.secretCode,
            startFromStage: cur.startFromStage,
            tokenId: cur.tokenId
        }

        var info:TeamInfo = {
            team: cur,
            appState: stageManager.getAppState(cur.tokenId)
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
    }
}

function processAddTeamRequest(request:AddTeamRequest):AddTeamResponse {
    var team = teamManager.findTeamByToken(request.token);
    if (!team || !team.admin) {
        return {
            success: false
        };
    }

    var newTeam = teamManager.createTeam(request.teamName);

    return {success: !!newTeam}
}


function checkToken(token:string):Team {
    return teamManager.findTeamByCode(token);
}

function toEkbString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format("YYYY-MM-DD HH:mm")
}


function getRestTime(request:GetRestTimeRequest):GetRestTimeResponse {
    var token = request.token;
    var team = checkToken(token);
    if (!team) {
        return {
            success: false
        }
    }

    if (!team.endQuestDate) {
        return {
            restTimeInSeconds: "-1",
            success: true
        }
    }

    var result = diffWithCurrentTime(team);
    return {
        success: true,
        restTimeInSeconds: String(result),
        isCompleted: result <= 0
    }
}

function checkTime(team:Team) {
    return diffWithCurrentTime(team) > 0;
}

function diffWithCurrentTime(team:Team) {
    var currentTime = moment();
    var endTime = moment(team.endQuestDate);

    return endTime.diff(currentTime, 'seconds');
}
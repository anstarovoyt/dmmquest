function getDefaultData() {
    return {
        stages: [
            {
                name: "Этап один. О полевых растениях",
                quests: [
                    "Это зеленое и растет на грядке в огроде у дедушки федора.",
                    "Это синее и не растет на грядке в огроде у дедушки федора.",
                    "Этоне растет вообще нигде, но может вас убить"
                ]
            },
            {
                name: "Этап два. О козлах отпущения",
                quests: [
                    "Козлы это животные. Назовите еще хоть одно животное.",
                    "Жирафы не козлы. Докажите это утверждение в трех словах",
                    "Путь самурая непрост. А каков путь козла-самурая?"
                ]
            },
            {
                name: "Этап три. О программистах",
                quests: [
                    "Как вы попали в сферу разработки ПО?",
                    "Какой был ваш первый язык программирования?",
                    "Сколько примерно будет 2^32?",
                    "Как сравнить две переменные типа double или float на равенство?",
                    "Что такое класс? Что такое объект? В чем разница?",
                    "Что такое член класса? Чем он отличается от других?",
                ]
            }],
        bonus: {
            name: "Этап бонус. О программистах",
            quests: [
                "Клонируйте овечку долли и докажите, что это ее копия",
                "Сколько попугает в жирафе? А есть он ходит по диагонали?",
                "Убейте какое-нибудь животное и пришлите фотографию"
            ]
        }
    };
}
var defaultData = getDefaultData();
var StageManager = (function () {
    function StageManager() {
        this.states = {};
        this.stagesNames = getStagesNames();
    }
    StageManager.prototype.setAnswers = function (token, stageId, answers) {
        var stage = this.getStage(token, stageId);
        if (!stage) {
            return null;
        }
        for (var _i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
            var answer = answers_1[_i];
            if (!stage.questAnswers) {
                stage.questAnswers = {};
            }
            stage.questAnswers[answer.id] = answer;
        }
        return stage;
    };
    StageManager.prototype.getStagesNames = function () {
        return this.stagesNames;
    };
    StageManager.prototype.closeStage = function (token, stageId) {
        var stage = this.getStage(token, stageId);
        if (stage.status != 1 /* OPEN */) {
            return this.getAppState(token);
        }
        stage.status = 2 /* COMPLETED */;
        var nextStage = this.getNextStage(token, stage);
        if (nextStage && nextStage.status == 0 /* LOCKED */) {
            nextStage.status = 1 /* OPEN */;
        }
        return this.getAppState(token);
    };
    StageManager.prototype.getQuestionTexts = function (token, stageId) {
        var appState = this.getAppState(token);
        var stage = getStageById(appState, stageId);
        if (!stage || stage.status == 0 /* LOCKED */) {
            return null;
        }
        if (stage.status == 3 /* BONUS */) {
            return defaultData.bonus.quests;
        }
        var stageInfo = defaultData.stages[Number(stageId)];
        return stageInfo && stageInfo.quests;
    };
    StageManager.prototype.getNextStage = function (token, stage) {
        var appState = this.getAppState(token);
        if (stage.status == 3 /* BONUS */) {
            return null;
        }
        var showNumber = stage.showNumber;
        var nextStage = appState.stages[showNumber + 1];
        if (!nextStage) {
            return null;
        }
        return nextStage;
    };
    StageManager.prototype.getStage = function (token, stageId) {
        var appState = this.getAppState(token);
        if (!appState) {
            return null;
        }
        return getStageById(appState, stageId);
    };
    StageManager.prototype.getAppState = function (token) {
        var state = this.states[token];
        if (state) {
            return state;
        }
        return this.createAppState(token);
    };
    StageManager.prototype.createAppState = function (token) {
        console.log('Create state:' + token);
        var team = teamManager.findTeamByToken(token);
        if (!team) {
            return;
        }
        var stages = [];
        var appState = {
            bonus: null,
            stages: stages
        };
        var defaultStages = defaultData.stages;
        var startFromStage = team.startFromStage;
        var pushNumber = 0;
        for (var i = startFromStage; i < defaultStages.length; i++) {
            var status = i == startFromStage ? 1 /* OPEN */ : 0 /* LOCKED */;
            stages.push({
                id: String(i),
                status: status,
                showNumber: pushNumber++
            });
        }
        for (var i = 0; i < startFromStage; i++) {
            stages.push({
                id: String(i),
                status: 0 /* LOCKED */,
                showNumber: pushNumber++
            });
        }
        appState.bonus = {
            id: "bonus",
            status: 3 /* BONUS */,
            showNumber: pushNumber++
        };
        this.states[token] = appState;
        return appState;
    };
    return StageManager;
}());
function getStageById(state, stageId) {
    if (!state) {
        return null;
    }
    for (var _i = 0, _a = state.stages; _i < _a.length; _i++) {
        var stage = _a[_i];
        if (stage.id == stageId) {
            return stage;
        }
    }
    if (stageId == 'bonus') {
        return state.bonus;
    }
    return null;
}
function getStagesNames() {
    var result = {};
    var stages = defaultData.stages;
    for (var i = 0; i < stages.length; i++) {
        var rawStage = stages[i];
        result[String(i)] = rawStage.name;
    }
    result['bonus'] = defaultData.bonus.name;
    return result;
}
var stageManager = new StageManager();
var TeamImpl = (function () {
    function TeamImpl() {
    }
    return TeamImpl;
}());
var TEAMS = [];
TEAMS.push({
    name: "Самая тестовая команда",
    secretCode: "test",
    tokenId: "test",
    startFromStage: 0
}, {
    name: "Самая тестовая команда 1",
    secretCode: "test2",
    tokenId: "test2",
    startFromStage: 1
});
var TeamManager = (function () {
    function TeamManager() {
    }
    TeamManager.prototype.findTeamByCode = function (secretCode) {
        for (var _i = 0, TEAMS_1 = TEAMS; _i < TEAMS_1.length; _i++) {
            var team = TEAMS_1[_i];
            if (team.secretCode == secretCode) {
                return team;
            }
        }
        return null;
    };
    TeamManager.prototype.findTeamByToken = function (tokenId) {
        for (var _i = 0, TEAMS_2 = TEAMS; _i < TEAMS_2.length; _i++) {
            var team = TEAMS_2[_i];
            if (team.tokenId == tokenId) {
                return team;
            }
        }
        return null;
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
        TEAMS.push(team);
        return team;
    };
    TeamManager.prototype.listTeams = function () {
        return TEAMS;
    };
    TeamManager.prototype.login = function (secretCode) {
        var team = this.findTeamByCode(secretCode);
        if (team) {
            return {
                authenticated: true,
                name: team.name,
                token: team.tokenId
            };
        }
        return { authenticated: false };
    };
    TeamManager.prototype.getNextStartFromStage = function () {
        var lastTeam = TEAMS[TEAMS.length - 1];
        var startFromStage = lastTeam.startFromStage;
        var nextStage = startFromStage + 1;
        if (nextStage < defaultData.stages.length) {
            return nextStage;
        }
        return 0;
    };
    TeamManager.makeid = function () {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    };
    return TeamManager;
}());
var teamManager = new TeamManager();
var minimist = require('minimist');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var PORT = process.env.PORT || 8080;
var TARGET_PATH_MAPPING = {
    BUILD: './build',
    DIST: './dist'
};
var TARGET = minimist(process.argv.slice(2)).TARGET || 'BUILD';
var server = express();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
    extended: true
}));
server
    .use(serveStatic(TARGET_PATH_MAPPING[TARGET]))
    .listen(PORT);
server.post('/quest-texts', function (req, res, next) {
    var request = req.body;
    res.json(processQuestTextsRequest(request));
});
server.post('/state', function (req, res, next) {
    console.log('requested state');
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
    console.log('login ' + request.secretCode);
    res.json(processLoginRequest(request));
});
server.post('/save', function (req, res, next) {
    var request = req.body;
    console.log(request);
    res.json(processAnswerUpdateRequest(request));
});
server.post('/complete', function (req, res, next) {
    var request = req.body;
    var token = request.token;
    var options = processAnswerUpdateRequest(request);
    if (!options.success) {
        res.json({
            authenticated: false
        });
        return;
    }
    res.json(stageManager.closeStage(token, request.stageId));
});
server.get('/stage/*', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});
server.get('/stages', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});
function processStateRequest(req) {
    var token = req.token;
    var team = checkToken(token);
    if (!team) {
        console.log('no team found');
        return { success: false };
    }
    return {
        success: true,
        state: {
            appState: stageManager.getAppState(token),
            stagesNames: stageManager.getStagesNames()
        }
    };
}
function processAnswerUpdateRequest(req) {
    var token = req.token;
    var team = checkToken(token);
    if (!team) {
        return { success: false };
    }
    var answers = stageManager.setAnswers(token, req.stageId, req.answers);
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
    if (!checkToken(token)) {
        return { success: false };
    }
    var questTexts = stageManager.getQuestionTexts(token, request.stageId);
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
                return {
                    id: i,
                    text: el
                };
            })
        }
    };
}
function checkToken(token) {
    return teamManager.findTeamByCode(token);
}
console.log('Created server for: ' + TARGET + ', listening on port ' + PORT);
//# sourceMappingURL=server.js.map
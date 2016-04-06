var minimist = require('minimist');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var path = require('path');
var PORT = 8082;
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
    console.log('post accepted');
    var request = req.body;
    res.json(processQuestTexts(request));
});
server.post('/state', function (req, res, next) {
    console.log('requested state');
    var request = req.body;
    res.json(processStateRequest(request));
});
server.post('/login', function (req, res, next) {
    var request = req.body;
    console.log('login ' + request.secretCode);
    res.json(processLoginRequest(request));
});
server.get('/stage/*', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});
server.get('/stages', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});
function processStateRequest(req) {
    var token = req.token;
    if (!checkToken(token)) {
        return { success: false };
    }
    return {
        success: true,
        state: loadState()
    };
}
function processLoginRequest(req) {
    return login(req.secretCode);
}
function processQuestTexts(request) {
    if (!checkToken(request.token)) {
        return { success: false };
    }
    return {
        success: true,
        questTexts: {
            stageId: request.stageId,
            quests: [{ id: 0, text: "Foo1" }, { id: 1, text: "Foo2" }]
        }
    };
}
function checkToken(token) {
    return true;
}
console.log('Created server for: ' + TARGET + ', listening on port ' + PORT);
var appState = (function () {
    var result = [];
    result.push({
        isBonus: false,
        isOpen: false,
        isCompleted: true,
        isLocked: false,
        id: 0
    });
    result.push({
        isBonus: false,
        isOpen: true,
        isCompleted: false,
        isLocked: false,
        id: 1
    });
    result.push({
        isBonus: false,
        isOpen: false,
        isCompleted: false,
        isLocked: true,
        id: 2
    });
    result.push({
        isBonus: false,
        isOpen: false,
        isCompleted: false,
        isLocked: true,
        id: 3
    });
    return {
        stages: result
    };
})();
function loadState() {
    //retrive from db
    return appState;
}
function setAnswers(stageId, answers) {
    var stage = appState.stages[stageId];
    for (var _i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
        var answer = answers_1[_i];
        stage.questAnswers[answer.id] = answer;
    }
}
function closeStage(stageId) {
    var stage = appState.stages[stageId];
    if (stage.isOpen) {
        stage.isOpen = false;
        stage.isCompleted = true;
        var nextStage = getNextStage(appState, stage);
        if (!nextStage.isCompleted) {
            nextStage.isOpen = true;
            nextStage.isLocked = false;
        }
    }
    return appState;
}
function getNextStage(appState, stage) {
    if (stage.isBonus) {
        return null;
    }
    var number = stage.id;
    var nextStage = appState.stages[number + 1];
    if (nextStage.isBonus) {
        return null;
    }
    return nextStage;
}
function login(secretCode) {
    if (secretCode == 'test') {
        return {
            authenticated: true,
            token: secretCode
        };
    }
    return { authenticated: false };
}
//# sourceMappingURL=server.js.map
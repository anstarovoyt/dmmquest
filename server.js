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
    res.json(processAnswerUpdate(request));
});
server.post('/complete', function (req, res, next) {
    console.log('complete');
    var request = req.body;
    console.log(request);
    var options = processAnswerUpdate(request);
    res.json(closeStage(request.stageId));
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
function processAnswerUpdate(req) {
    if (!checkToken(req.token)) {
        return { success: false };
    }
    return { success: setAnswers(req.stageId, req.answers) };
}
function processLoginRequest(req) {
    return login(req.secretCode);
}
function processQuestTexts(request) {
    if (!checkToken(request.token)) {
        return { success: false };
    }
    var questTexts = getQuestTexts(request.stageId);
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
    return true;
}
console.log('Created server for: ' + TARGET + ', listening on port ' + PORT);
var data = getData();
var appState = (function () {
    var result = [];
    for (var count = 0; count < data.length; count++) {
        var el = data[count];
        var stage = {};
        var isBonus = el.isBonus;
        if (isBonus)
            stage.isBonus = true;
        stage.name = el.name;
        stage.id = count;
        stage.isCompleted = false;
        var isFirst = stage.id == 0;
        stage.isLocked = !isFirst && !isBonus;
        stage.isOpen = isFirst || el.isBonus;
        result.push(stage);
    }
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
        if (!stage.questAnswers) {
            stage.questAnswers = {};
        }
        stage.questAnswers[answer.id] = answer;
    }
    return true;
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
            token: secretCode,
            name: "Тестовая команда"
        };
    }
    return { authenticated: false };
}
function getQuestTexts(stageId) {
    var result = data[stageId];
    return result == null ? null : result.quests;
}
function getData() {
    return [
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
        },
        {
            name: "Этап бонус. О программистах",
            isBonus: true,
            quests: [
                "Клонируйте овечку долли и докажите, что это ее копия",
                "Сколько попугает в жирафе? А есть он ходит по диагонали?",
                "Убейте какое-нибудь животное и пришлите фотографию"
            ]
        }
    ];
}
//# sourceMappingURL=server.js.map
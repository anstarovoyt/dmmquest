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
server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

server
    .use(serveStatic(TARGET_PATH_MAPPING[TARGET]))
    .listen(PORT);

server.post('/quest-texts', (req, res, next) => {
    console.log('post accepted');
    var request:QuestTextsRequest = req.body;

    res.json(processQuestTexts(request));
});

server.post('/state', (req, res, next) => {
    console.log('requested state');
    var request:AppStateRequest = req.body;
    res.json(processStateRequest(request));
});

server.post('/login', (req, res, next) => {
    var request:LoginRequest = req.body;
    console.log('login ' + request.secretCode);
    res.json(processLoginRequest(request));
});


server.get('/stage/*', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});

server.get('/stages', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
})


function processStateRequest(req:AppStateRequest):AppStateResponse {
    var token = req.token;
    if (!checkToken(token)) {
        return {success: false}
    }

    return {
        success: true,
        state: loadState()
    }
}

function processLoginRequest(req:LoginRequest):LoginInfo {
    return login(req.secretCode);
}

function processQuestTexts(request:QuestTextsRequest):QuestTextsResponse {
    if (!checkToken(request.token)) {
        return {success: false};
    }

    return {
        success: true,
        questTexts: {
            stageId: request.stageId,
            quests: [{id: 0, text: "Foo1"}, {id: 1, text: "Foo2"}]
        }
    }
}

function checkToken(token:string):boolean {
    return true;
}


console.log('Created server for: ' + TARGET + ', listening on port ' + PORT);
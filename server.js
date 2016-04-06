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
server.get('/stage/*', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});
server.get('/stages', function (req, res, next) {
    res.sendFile(path.join(__dirname, TARGET, '/index.html'));
});
function processQuestTexts(request) {
    if (!checkToken(request.token)) {
        return { success: false };
    }
    return {
        success: true,
        questTexts: {
            stageId: request.stageId,
            quests: [{ id: "1", text: "Foo1" }, { id: "2", text: "Foo2" }]
        }
    };
}
function checkToken(token) {
    return true;
}
console.log('Created server for: ' + TARGET + ', listening on port ' + PORT);
//# sourceMappingURL=server.js.map
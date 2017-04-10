import {stageManager} from "./StageManager";
import {teamManager} from "./TeamManager";
import {TEAMS_CACHE} from "./RedisClient";
import {logServer} from "./utils";

let minimist = require('minimist');
let express = require('express');
let serveStatic = require('serve-static');
let bodyParser = require('body-parser');
let path = require('path');
let moment = require('moment-timezone');
let PORT = process.env.PORT || 8080;
let TARGET_PATH_MAPPING = {
    BUILD: './build',
    DIST: './dist'
};


let TARGET = minimist(process.argv.slice(2)).TARGET || 'BUILD';

export function initServer() {
    logServer('Start creating server, port ' + PORT);
    let server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));


    server
        .use(serveStatic(TARGET_PATH_MAPPING[TARGET]))
        .use('/statics', express.static(__dirname + '/statics'))
        .listen(PORT);

    server.post('/quest-texts', (req, res, next) => {
        let request: QuestTextsRequest = req.body;

        res.json(processQuestTextsRequest(request));
    });

    server.post('/state', (req, res, next) => {
        let request: AppStateRequest = req.body;
        res.json(processStateRequest(request));
    });

    server.post('/login', (req, res, next) => {
        let request: LoginRequest = req.body;

        if (!request.secretCode) {
            res.json({
                authenticated: false
            });
            return;
        }

        res.json(processLoginRequest(request));
    });

    server.post('/save', (req, res, next) => {
        let request: AnswersUpdateRequest = req.body;


        res.json(processAnswerUpdateRequest(request, false));
    });
    //
    server.post('/complete', (req, res, next) => {
        let request: AnswersUpdateRequest = req.body;

        let token = request.token;
        let options = processAnswerUpdateRequest(request, true);
        if (!options.success) {
            res.json({
                success: false
            });
            return;
        }
        let result = stageManager.closeStage(token, request.stageId);
        let response: CompleteStageResponse = {
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
        let request: TeamsRequest = req.body;
        res.json(processGetTeamsRequest(request));
    });

    server.post('/remove-team', (req, res, next) => {
        let request: RemoveTeamRequest = req.body;
        res.json(processRemoveTeamRequest(request));
    });


    server.post('/add-team', (req, res, next) => {
        let request: AddTeamRequest = req.body;
        res.json(processAddTeamRequest(request));
    });

    server.post('/rest-time', (req, res, next) => {
        let request: GetRestTimeRequest = req.body;
        res.json(getRestTime(request));
    });

    server.post('/unlock-stage', (req, res, next) => {
        let request: UnlockLastCompletedStageRequest = req.body;
        let team = checkToken(request.token);
        if (!team || !team.admin) {
            res.json({
                success: false
            })
        }

        res.json({
            success: stageManager.unlockLastStage(request.teamTokenId)
        });
    });

    server.post('/sign_s3', (req, response, next) => {
        let request: GetAWSSignRequest = req.body;
        let team = checkToken(request.token);
        if (!team) {
            return;
        }

        processGetAWS(request, (result) => {
            console.log('aws req: ' + JSON.stringify(result));
            response.json(result);
        })
    });


    logServer('Created server for: ' + TARGET + ', listening on port ' + PORT);
}


function processStateRequest(req: AppStateRequest): FullAppStateResponse {
    let token = req.token;
    let team = checkToken(token);
    if (!team) {
        logServer('Internal error. No team for token ' + token);
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

function processAnswerUpdateRequest(req: AnswersUpdateRequest, fromClose: boolean): AnswersUpdateResponse {
    let token = req.token;
    let team = checkToken(token);

    if (!team) {
        return {success: false};
    }

    if (!checkTime(team)) {
        logServer('Try to save answers "' + token + '" after complete ' + JSON.stringify(req.answers));
        return {success: false};
    }

    let answers = stageManager.setAnswers(token, req.stageId, req.answers, fromClose);
    return {
        success: !!answers,
        stage: answers
    }
}

function processLoginRequest(req: LoginRequest): LoginInfo {
    return teamManager.login(req.secretCode);
}

function processQuestTextsRequest(request: QuestTextsRequest): QuestTextsResponse {
    let token = request.token;
    let team = checkToken(token);
    if (!team) {
        return {success: false};
    }

    let questTexts = stageManager.getQuestionTexts(token, request.stageId);
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
                let text;
                let type;
                if (typeof el === "string") {
                    text = el;
                } else {
                    text = el.text;
                    type = el.type;
                }

                let result: Quest = {
                    id: i,
                    text: text
                };
                if (type) {
                    result.type = type;
                }

                return result
            })
        }
    }
}

function processRemoveTeamRequest(request: RemoveTeamRequest): RemoveTeamResponse {
    let token = request.token;
    let team = checkToken(token);
    if (!team || !team.admin) {
        return {
            success: false
        }
    }

    let result = teamManager.removeTeam(request.teamTokenId);

    return {
        success: result
    }
}

function processGetTeamsRequest(request: TeamsRequest): TeamsResponse {
    let token = request.token;
    let team = checkToken(token);
    if (!team || !team.admin) {
        return {
            success: false
        }
    }

    let result: TeamInfo[] = [];

    for (let cur of TEAMS_CACHE) {
        let teamSimple: TeamSimple = {
            admin: cur.admin,
            name: cur.name,
            secretCode: cur.secretCode,
            startFromStage: cur.startFromStage,
            tokenId: cur.tokenId
        }

        let info: TeamInfo = {
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

function processAddTeamRequest(request: AddTeamRequest): AddTeamResponse {
    let team = teamManager.findTeamByToken(request.token);
    if (!team || !team.admin) {
        return {
            success: false
        };
    }

    let newTeam = teamManager.createTeam(request.teamName);

    return {success: !!newTeam}
}


export function checkToken(token: string): Team {
    return teamManager.findTeamByCode(token);
}

export function toEkbString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format("YYYY-MM-DD HH:mm")
}


function getRestTime(request: GetRestTimeRequest): GetRestTimeResponse {
    let token = request.token;
    let team = checkToken(token);
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

    let result = diffWithCurrentTime(team);
    return {
        success: true,
        restTimeInSeconds: String(result),
        isCompleted: result <= 0
    }
}


function checkTime(team: Team) {
    if (!team.endQuestDate) {
        return true;
    }
    return diffWithCurrentTime(team) > 0;
}


function diffWithCurrentTime(team: Team) {
    let currentTime = moment();

    let endTime = moment(team.endQuestDate);


    return endTime.diff(currentTime, 'seconds');
}
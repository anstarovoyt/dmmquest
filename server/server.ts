import {TeamManager} from './TeamManager';
import {logServer, toEkbString} from './utils';
import {initStore} from './Store';
import {StageManager} from './StageManager';
import {StateManager} from './StateManager';
import {QuestText} from './data';
import {processGetAWS} from './AwsClient';

let minimist = require('minimist');
let express = require('express');
let serveStatic = require('serve-static');
let bodyParser = require('body-parser');
let path = require('path');
let moment = require('moment-timezone');
let PORT = process.env.PORT || 8080;
let TARGET_PATH_MAPPING = {
    BUILD: 'build',
    DIST: 'dist'
};

const dbStore = initStore(initServer);
const startDir = path.dirname(__dirname);
logServer(startDir);

let TARGET = minimist(process.argv.slice(2)).TARGET || 'BUILD';

export function initServer() {
    logServer('Start http server');
    const stateManager = new StateManager(dbStore);
    const teamManager: TeamManager = new TeamManager(stateManager, dbStore);
    const stageManager = new StageManager(teamManager, stateManager);

    logServer('Start creating server, port ' + PORT);
    let server = express();

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));


    let appStatics = path.join(startDir, TARGET_PATH_MAPPING[TARGET]);
    logServer('App: ' + appStatics);
    let resources = path.join(startDir, 'statics');
    server
        .use(serveStatic(appStatics))
        .use('/statics', express.static(resources))
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
        res.sendFile(path.join(startDir, TARGET, '/index.html'));
    });

    server.get('/stages', function (req, res, next) {
        res.sendFile(path.join(startDir, TARGET, '/index.html'));
    });

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
            });
        }

        res.json({
            success: stageManager.unlockStage(request.teamTokenId, request.stageId)
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
        });
    });

    server.post('/result_killer', (req, res, next) => {
        let request: { token: string } = req.body;
        let team = checkToken(request.token);
        if (!team) {
            return;
        }

        let gameResult = stageManager.getGameResult(request.token);

        res.json({
            description: gameResult
        });
    });


    logServer('Created server for: ' + TARGET + ', listening on port ' + PORT);

    function processStateRequest(req: AppStateRequest): FullAppStateResponse {
        let token = req.token;
        let team = checkToken(token);
        if (!team) {
            logServer('Internal error. No team for token ' + token);
            return {success: false};
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

        let reqAnswers = req.answers ? req.answers : [];
        let reqTeamBonuses = req.teamBonuses ? req.teamBonuses : [];
        let answers = stageManager.setAnswers(token, req.stageId, reqAnswers, reqTeamBonuses, fromClose);
        return {
            success: !!answers,
            stage: answers
        };
    }

    function processLoginRequest(req: LoginRequest): LoginInfo {
        let result = teamManager.login(req.secretCode);
        if (result.authenticated && result.first) {
            stageManager.updateInitialState(result.token, new Date());
        }
        return result;
    }

    function processQuestTextsRequest(request: QuestTextsRequest): QuestTextsResponse {
        let token = request.token;
        let team = checkToken(token);
        if (!team) {
            return {success: false};
        }

        let questsInfo = stageManager.getQuestionTexts(token, request.stageId);
        const quests = questsInfo.texts;
        if (!quests) {
            return {
                success: false
            };
        }

        let resultQuests: Quest[] = [];


        quests.forEach(function (el, i) {
            let show = el.show;
            if (!show) return;

            let quest = el.quest;

            let text;
            let type;
            let values = null;
            if (typeof quest === 'string') {
                text = quest;
            } else if (quest) {
                text = quest.text;
                type = quest.type;
                values = quest.values;
            }

            let result: Quest = {
                id: i,
                text: text,
            };
            if (type) {
                result.type = type;
            }

            if (values) {
                result.values = values;
            }

            if (el.stageName) {
                result.stageName = el.stageName;
            }

            resultQuests.push(result);
        });

        return {
            success: true,

            questTexts: {
                stageId: request.stageId,
                quests: resultQuests,
                stageDescription: questsInfo.description
            }
        };
    }

    function processRemoveTeamRequest(request: RemoveTeamRequest): RemoveTeamResponse {
        let token = request.token;
        let team = checkToken(token);
        if (!team || !team.admin) {
            return {
                success: false
            };
        }

        let result = teamManager.removeTeam(request.teamTokenId);

        return {
            success: result
        };
    }

    function processGetTeamsRequest(request: TeamsRequest): TeamsResponse {
        let token = request.token;
        let team = checkToken(token);
        if (!team || !team.admin) {
            return {
                success: false
            };
        }

        let result: TeamInfo[] = [];

        for (let cur of dbStore.getTeams()) {
            let teamSimple: TeamSimple = {
                admin: cur.admin,
                name: cur.name,
                secretCode: cur.secretCode,
                startFromStage: cur.startFromStage,
                tokenId: cur.tokenId
            };


            let fullStagesInfo = stageManager.getFullStagesInfo(cur);

            let appState = teamManager.getAppState(cur.tokenId);

            let stagePenalties = stageManager.geStagePenalties(cur, appState);

            let info: TeamInfo = {
                stagePenalties: stagePenalties,
                stagesInfo: fullStagesInfo,
                team: cur,
                appState: appState
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

    function processAddTeamRequest(request: AddTeamRequest): AddTeamResponse {
        let team = teamManager.findTeamByToken(request.token);
        if (!team || !team.admin) {
            return {
                success: false
            };
        }

        let newTeam = teamManager.createTeam(request.teamName);

        return {success: !!newTeam};
    }


    function checkToken(token: string): Team {
        return teamManager.findTeamByCode(token);
    }

    function getRestTime(request: GetRestTimeRequest): GetRestTimeResponse {
        let token = request.token;
        let team = checkToken(token);
        if (!team) {
            return {
                success: false
            };
        }

        if (!team.endQuestDate) {
            return {
                restTimeInSeconds: '-1',
                success: true
            };
        }

        let result = diffWithCurrentTime(team);
        return {
            success: true,
            restTimeInSeconds: String(result),
            isCompleted: result <= 0
        };
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
}



import {teamManager} from "./TeamManager";
import {initDefaultStateObject, saveAppDB} from "./RedisClient";
import {toEkbString} from "./server";
import {defaultData} from "./data";
import {logServer} from "./utils";

export class StageManager {

    states:{
        [token:string]:AppState;
    } = {};

    private stagesNames:{
        [stageId:string]:string;
    } = getStagesNames();


    setAnswers(token:string, stageId:string, answers:QuestAnswer[], fromClose:boolean) {
        let stage: Stage = this.getStage(token, stageId);
        if (!stage) {
            return null;
        }
        if (stage.status == StageStatus.COMPLETED ||
            stage.status == StageStatus.LOCKED) {
            return null;
        }

        for (let answer of answers) {
            if (!stage.questAnswers) {
                stage.questAnswers = {}
            }

            const oldAnswer = stage.questAnswers[answer.id];
            if (fromClose && oldAnswer && oldAnswer.answer && !answer.answer) {
                continue;
            }

            stage.questAnswers[answer.id] = answer;
        }


        const stagesName = this.stagesNames[stageId];
        logServer('Updated answers "' + token + '" for stage "' + stagesName + '". Answers: ' + JSON.stringify(answers));

        this.saveAppStateToDB(token, this.getAppState(token), (err) => {
            if (!err) {
                logServer('Saved new answers "' + token + '" to DB for ' + stagesName);
            } else {
                logServer('ALERT! Erorr save new answers to DB for ' + stagesName);
            }
        });
        return stage;
    }

    getStagesNames() {
        return this.stagesNames;
    }


    closeStage(token:string, stageId:string):AppState {
        let stage: Stage = this.getStage(token, stageId);
        if (!stage || stage.status != StageStatus.OPEN) {
            return this.getAppState(token);
        }


        stage.status = StageStatus.COMPLETED;
        stage.closedTime = toEkbString(new Date());
        let appState = this.getAppState(token);
        const nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
        }

        if (stage.last) {
            //close bonus if the stage is last
            appState.bonus.status = StageStatus.COMPLETED;
            appState.bonus.closedTime = toEkbString(new Date());
        }

        const info = this.stagesNames[stageId] + ' team ' + teamManager.findTeamByToken(token).name;
        logServer('Closed stage token ' + token + ' stage ' + info);

        appState = this.getAppState(token);

        this.saveAppStateToDB(token, appState, (err) => {
            if (!err) {
                logServer('Update app state for ' + info)
            } else {
                logServer('ALERT: Error update app state for ' + info)
            }
        });
        return appState;
    }


    getQuestionTexts(token:string, stageId:string):(string|{type:QuestType, text:string})[] {
        const appState = this.getAppState(token);
        let stage = getStageById(appState, stageId);
        if (!stage || stage.status == StageStatus.LOCKED) {
            return null;
        }

        if (stage.status == StageStatus.BONUS ||
            stageId == "bonus") {
            return defaultData.bonus.quests;
        }

        const stageInfo = defaultData.stages[Number(stageId)];


        return stageInfo && stageInfo.quests;
    }

    unlockLastStage(tokenId:string):boolean {

        const appState = this.getAppState(tokenId);
        let team = teamManager.findTeamByToken(tokenId);
        if (!team) {
            logServer('Unlock request for incorrect team ' + team.tokenId);
            return false;
        }
        let lastCompletedStage: Stage = null;
        let number = 0;
        const stages = appState.stages;
        for (let stage of stages) {
            number++;
            if (stage.status == StageStatus.COMPLETED) {
                lastCompletedStage = stage;
            }
        }

        if (lastCompletedStage == null) {
            return false;
        }

        lastCompletedStage.status = StageStatus.OPEN;
        logServer('Unlocked stage ' + this.stagesNames[lastCompletedStage.id] + ' for ' + tokenId);
        delete lastCompletedStage.closedTime;

        if (number == stages.length &&
            appState.bonus.status == StageStatus.COMPLETED) {
            appState.bonus.status = StageStatus.BONUS;
            delete lastCompletedStage.closedTime;
            logServer('Unlocked bonus for ' + tokenId);
        }

        this.saveAppStateToDB(team.tokenId, appState, (err) => {
            if (!err) {
                logServer('Update unlock stage for ' + team.tokenId + "  stage " + this.stagesNames[lastCompletedStage.id]);
            } else {
                logServer('ALERT: Error update unlock stage for ' + team.tokenId)
            }
        })

        return true;
    }

    getNextStage(appState:AppState, stage:Stage):Stage {
        if (stage.status == StageStatus.BONUS) {
            return null;
        }

        const showNumber = stage.showNumber;

        let nextStage = appState.stages[showNumber + 1];
        if (!nextStage) {
            return null;
        }

        return nextStage;
    }

    getStage(token:string, stageId:string) {
        let appState = this.getAppState(token);

        if (!appState) {
            return null;
        }

        return getStageById(appState, stageId);
    }

    getAppState(token:string):AppState {
        const state = this.states[token];
        if (state) {
            return state;
        }

        return this.createAppState(token);
    }

    createAppState(token:string) {
        logServer('Init state:' + token);
        let team = teamManager.findTeamByToken(token);
        if (!team) {
            return;
        }

        return initDefaultStateObject(team);
    }

    saveAppStateToDB(token:string, state:AppState, callback?:(res) => void) {
        saveAppDB(token, state, callback);
    }

}

export function getStageById(state:AppState, stageId:string) {
    if (!state) {
        return null;
    }
    for (const stage of state.stages) {
        if (stage.id == stageId) {
            return stage;
        }
    }

    if (stageId == 'bonus') {
        return state.bonus;
    }

    return null;
}

export function getStagesNames() {
    const result: any = {};
    const stages = defaultData.stages;
    for (let i = 0; i < stages.length; i++) {
        const rawStage = stages[i];

        result[String(i)] = rawStage.name;
    }


    result['bonus'] = defaultData.bonus.name;

    return result;
}


export const stageManager = new StageManager();

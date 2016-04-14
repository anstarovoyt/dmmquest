class StageManager {

    states:{
        [token:string]:AppState;
    } = {};

    private stagesNames:{
        [stageId:string]:string;
    } = getStagesNames();


    setAnswers(token:string, stageId:string, answers:QuestAnswer[]) {
        var stage:Stage = this.getStage(token, stageId);
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
            stage.questAnswers[answer.id] = answer;
        }


        var stagesName = this.stagesNames[stageId];
        log('Updated answers for stage ' + stagesName + '. Answers: ' + JSON.stringify(answers));

        this.saveAppStateToDB(token, this.getAppState(token), () => {
            log('Saved new answers to DB for ' + stagesName);
        });
        return stage;
    }

    getStagesNames() {
        return this.stagesNames;
    }


    closeStage(token:string, stageId:string):AppState {
        var stage:Stage = this.getStage(token, stageId);
        if (!stage || stage.status != StageStatus.OPEN) {
            return this.getAppState(token);
        }


        stage.status = StageStatus.COMPLETED;
        var appState = this.getAppState(token);
        var nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
        }

        if (stage.last) {
            //close bonus if the stage is last
            appState.bonus.status = StageStatus.COMPLETED;
        }

        var info = this.stagesNames[stageId] + ' team ' + teamManager.findTeamByToken(token).name;
        log('Closed stage ' + info);

        var appState = this.getAppState(token);

        this.saveAppStateToDB(token, appState, () => {
            log('Update app state for ' + info)
        });
        return appState;
    }


    getQuestionTexts(token:string, stageId:string) {
        var appState = this.getAppState(token);
        var stage = getStageById(appState, stageId);
        if (!stage || stage.status == StageStatus.LOCKED) {
            return null;
        }

        if (stage.status == StageStatus.BONUS) {
            return defaultData.bonus.quests;
        }

        var stageInfo = defaultData.stages[Number(stageId)];


        return stageInfo && stageInfo.quests;
    }

    getNextStage(appState:AppState, stage:Stage):Stage {
        if (stage.status == StageStatus.BONUS) {
            return null;
        }

        var showNumber = stage.showNumber;

        var nextStage = appState.stages[showNumber + 1];
        if (!nextStage) {
            return null;
        }

        return nextStage;
    }

    getStage(token:string, stageId:string) {
        var appState = this.getAppState(token);

        if (!appState) {
            return null;
        }

        return getStageById(appState, stageId);
    }

    getAppState(token:string):AppState {
        var state = this.states[token];
        if (state) {
            return state;
        }

        return this.createAppState(token);
    }

    createAppState(token:string) {
        log('Init state:' + token);
        var team = teamManager.findTeamByToken(token);
        if (!team) {
            return;
        }

        return initDefaultStateObject(team);
    }

    saveAppStateToDB(token:string, state:AppState, callback?:(res) => void) {
        client.hset(APP_STATE_KEY, token, JSON.stringify(state), callback);
    }

}

function getStageById(state:AppState, stageId:string) {
    if (!state) {
        return null;
    }
    for (var stage of state.stages) {
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
    var result:any = {};
    var stages = defaultData.stages;
    for (var i = 0; i < stages.length; i++) {
        var rawStage = stages[i];

        result[String(i)] = rawStage.name;
    }


    result['bonus'] = defaultData.bonus.name;

    return result;
}


var stageManager = new StageManager();

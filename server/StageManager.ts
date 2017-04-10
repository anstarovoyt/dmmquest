class StageManager {

    states:{
        [token:string]:AppState;
    } = {};

    private stagesNames:{
        [stageId:string]:string;
    } = getStagesNames();


    setAnswers(token:string, stageId:string, answers:QuestAnswer[], fromClose:boolean) {
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

            var oldAnswer = stage.questAnswers[answer.id];
            if (fromClose && oldAnswer && oldAnswer.answer && !answer.answer) {
                continue;
            }

            stage.questAnswers[answer.id] = answer;
        }


        var stagesName = this.stagesNames[stageId];
        log('Updated answers "' + token + '" for stage "' + stagesName + '". Answers: ' + JSON.stringify(answers));

        this.saveAppStateToDB(token, this.getAppState(token), (err) => {
            if (!err) {
                log('Saved new answers "' + token + '" to DB for ' + stagesName);
            } else {
                log('ALERT! Erorr save new answers to DB for ' + stagesName);
            }
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
        stage.closedTime = toEkbString(new Date());
        var appState = this.getAppState(token);
        var nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
        }

        if (stage.last) {
            //close bonus if the stage is last
            appState.bonus.status = StageStatus.COMPLETED;
            appState.bonus.closedTime = toEkbString(new Date());
        }

        var info = this.stagesNames[stageId] + ' team ' + teamManager.findTeamByToken(token).name;
        log('Closed stage token ' + token + ' stage ' + info);

        var appState = this.getAppState(token);

        this.saveAppStateToDB(token, appState, (err) => {
            if (!err) {
                log('Update app state for ' + info)
            } else {
                log('ALERT: Error update app state for ' + info)
            }
        });
        return appState;
    }


    getQuestionTexts(token:string, stageId:string):(string|{type:QuestType, text:string})[] {
        var appState = this.getAppState(token);
        var stage = getStageById(appState, stageId);
        if (!stage || stage.status == StageStatus.LOCKED) {
            return null;
        }

        if (stage.status == StageStatus.BONUS ||
            stageId == "bonus") {
            return defaultData.bonus.quests;
        }

        var stageInfo = defaultData.stages[Number(stageId)];


        return stageInfo && stageInfo.quests;
    }

    unlockLastStage(tokenId:string):boolean {

        var appState = this.getAppState(tokenId);
        var team = teamManager.findTeamByToken(tokenId);
        if (!team) {
            log('Unlock request for incorrect team ' + team.tokenId);
            return false;
        }
        var lastCompletedStage:Stage = null;
        var number = 0;
        var stages = appState.stages;
        for (var stage of stages) {
            number++;
            if (stage.status == StageStatus.COMPLETED) {
                lastCompletedStage = stage;
            }
        }

        if (lastCompletedStage == null) {
            return false;
        }

        lastCompletedStage.status = StageStatus.OPEN;
        log('Unlocked stage ' + this.stagesNames[lastCompletedStage.id] + ' for ' + tokenId);
        delete lastCompletedStage.closedTime;

        if (number == stages.length &&
            appState.bonus.status == StageStatus.COMPLETED) {
            appState.bonus.status = StageStatus.BONUS;
            delete lastCompletedStage.closedTime;
            log('Unlocked bonus for ' + tokenId);
        }

        this.saveAppStateToDB(team.tokenId, appState, (err) => {
            if (!err) {
                log('Update unlock stage for ' + team.tokenId + "  stage " + this.stagesNames[lastCompletedStage.id]);
            } else {
                log('ALERT: Error update unlock stage for ' + team.tokenId)
            }
        })

        return true;
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

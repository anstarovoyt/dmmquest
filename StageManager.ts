class StageManager {

    private states:{
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

        for (let answer of answers) {
            if (!stage.questAnswers) {
                stage.questAnswers = {}
            }
            stage.questAnswers[answerId.id] = answerId;
        }

        return stage;
    }

    getStagesNames() {
        return this.stagesNames;
    }


    closeStage(token:string, stageId:string):AppState {
        var stage:Stage = this.getStage(token, stageId);
        if (stage.status != StageStatus.OPEN) {
            return this.getAppState(token);
        }

        stage.status = StageStatus.COMPLETED;
        var nextStage = this.getNextStage(token, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
        }

        return this.getAppState(token);
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

    getNextStage(token:string, stage:Stage):Stage {
        var appState = this.getAppState(token);
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
        console.log('Create state:' + token)
        var team = teamManager.findTeamByToken(token);
        if (!team) {
            return;
        }


        var stages:Stage[] = [];
        var appState:AppState = {
            bonus: null,
            stages
        }

        var defaultStages = defaultData.stages;
        var startFromStage = team.startFromStage;
        var pushNumber:number = 0;
        for (var i = startFromStage; i < defaultStages.length; i++) {
            var status = i == startFromStage ? StageStatus.OPEN : StageStatus.LOCKED;
            stages.push({
                id: String(i),

                status: status,
                showNumber: pushNumber++
            });
        }

        for (var i = 0; i < startFromStage; i++) {
            stages.push({
                id: String(i),
                status: StageStatus.LOCKED,
                showNumber: pushNumber++
            });
        }

        appState.bonus = {
            id: "bonus",
            status: StageStatus.BONUS,
            showNumber: pushNumber++
        }

        this.states[token] = appState;

        return appState;
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

interface RawStage {
    name:string,
    quests:string[]
    status?:StageStatus
}

var data = getDefaultData();

var appState:AppState = (function () {

    var result:Stage[] = [];

    var stages = data.stages;

    for (var count = 0; count < stages.length; count++) {
        var el = stages[count];
        var stage:Stage = <any>{};
        stage.name = el.name;
        stage.id = count;

        var isFirst = stage.id == 0;
        stage.status = isFirst ? StageStatus.OPEN : StageStatus.LOCKED;

        result.push(stage);
    }

    var bonus = data.bonus;
    result.push({
        name: bonus.name,
        id: stages.length,
        status: StageStatus.BONUS
    });


    return {
        stages: result
    }
})();


function loadState():AppState {
    //retrive from db
    return appState;
}

function setAnswers(stageId:number, answers:QuestAnswer[]):boolean {
    var stage:Stage = appState.stages[stageId];
    for (let answer of answers) {
        if (!stage.questAnswers) {
            stage.questAnswers = {}
        }
        stage.questAnswers[answer.id] = answer;
    }

    return true;
}

function closeStage(stageId:number) {
    var stage:Stage = appState.stages[stageId];
    if (stage.status == StageStatus.OPEN) {
        stage.status = StageStatus.COMPLETED;

        var nextStage = getNextStage(appState, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
        }
    }

    return appState;
}

function getNextStage(appState:AppState, stage:Stage):Stage {
    if (stage.status == StageStatus.BONUS) {
        return null;
    }
    var number = stage.id;

    var nextStage = appState.stages[number + 1];
    if (nextStage.status == StageStatus.BONUS) {
        return null;
    }

    return nextStage;
}

function login(secretCode:string):LoginInfo {
    if (secretCode == 'test') {
        return {
            authenticated: true,
            token: secretCode,
            name: "Тестовая команда"
        }
    }
    return {authenticated: false}
}

function getQuestTexts(stageId:number) {
    var stages = data.stages;
    let result;
    if (stages.length > stageId) {
        result = stages[stageId];
    } else {
        result = data.bonus;
    }

    var stage = appState.stages[stageId];
    if (!stage) {
        return null;
    }
    if (stage.status == StageStatus.LOCKED) {
        return null;
    }

    return result == null ? null : result.quests;
}
var appState:AppState = (function () {
    var result:Stage[] = [];
    result.push({
        isBonus: false,
        isOpen: false,
        isCompleted: true,
        isLocked:false,
        id: 0
    });
    result.push({
        isBonus: false,
        isOpen: true,
        isCompleted: false,
        isLocked:false,
        id: 1
    });
    result.push({
        isBonus: false,
        isOpen: false,
        isCompleted: false,
        isLocked:true,
        id: 2
    });
    result.push({
        isBonus: false,
        isOpen: false,
        isCompleted: false,
        isLocked:true,
        id: 3
    });

    return {
        stages: result
    }
})();

function loadState():AppState {
    //retrive from db
    return appState;
}

function setAnswers(stageId:number, answers:QuestAnswer[]) {
    var stage:Stage = appState.stages[stageId];
    for (let answer of answers) {
        stage.questAnswers[answer.id] = answer;
    }
}

function closeStage(stageId:number) {
    var stage:Stage = appState.stages[stageId];
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

function getNextStage(appState:AppState, stage:Stage):Stage {
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

function login(secretCode:string):LoginInfo {
    if (secretCode == 'test') {
        return {
            authenticated: true,
            token: secretCode
        }
    }
    return {authenticated: false}
}
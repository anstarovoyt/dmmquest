interface RawStage {
    name:string,
    isBonus?:boolean,
    quests:string[]
}

var data = getData();

var appState:AppState = (function () {

    var result:Stage[] = [];


    for (var count = 0; count < data.length; count++) {
        var el = data[count];
        var stage:Stage = <any>{}
        var isBonus = el.isBonus;
        if (isBonus) stage.isBonus = true;
        stage.name = el.name;
        stage.id = count;
        stage.isCompleted = false;
        var isFirst = stage.id == 0;
        stage.isLocked = !isFirst && !isBonus;
        stage.isOpen = isFirst || el.isBonus;

        result.push(stage);
    }


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
            token: secretCode,
            name: "Тестовая команда"
        }
    }
    return {authenticated: false}
}

function getQuestTexts(stageId:number) {
    var result = data[stageId];
    return result == null ? null : result.quests;
}
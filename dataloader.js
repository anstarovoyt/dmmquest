var data = getData();
var appState = (function () {
    var result = [];
    for (var count = 0; count < data.length; count++) {
        var el = data[count];
        var stage = {};
        var isBonus = el.isBonus;
        if (isBonus)
            stage.isBonus = true;
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
    };
})();
function loadState() {
    //retrive from db
    return appState;
}
function setAnswers(stageId, answers) {
    var stage = appState.stages[stageId];
    for (var _i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
        var answer = answers_1[_i];
        if (!stage.questAnswers) {
            stage.questAnswers = {};
        }
        stage.questAnswers[answer.id] = answer;
    }
    return true;
}
function closeStage(stageId) {
    var stage = appState.stages[stageId];
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
function getNextStage(appState, stage) {
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
function login(secretCode) {
    if (secretCode == 'test') {
        return {
            authenticated: true,
            token: secretCode,
            name: "Тестовая команда"
        };
    }
    return { authenticated: false };
}
function getQuestTexts(stageId) {
    var result = data[stageId];
    return result == null ? null : result.quests;
}
//# sourceMappingURL=dataloader.js.map
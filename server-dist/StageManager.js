"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = require("./data");
var utils_1 = require("./utils");
var StageManager = (function () {
    function StageManager(teamManager, stateManager) {
        this.teamManager = teamManager;
        this.stateManager = stateManager;
        this.stagesNames = getStagesNames();
    }
    StageManager.prototype.setAnswers = function (token, stageId, answers, fromClose) {
        var stage = this.getStage(token, stageId);
        if (!stage) {
            return null;
        }
        if (stage.status == 2 /* COMPLETED */ ||
            stage.status == 0 /* LOCKED */) {
            return null;
        }
        for (var _i = 0, answers_1 = answers; _i < answers_1.length; _i++) {
            var answer = answers_1[_i];
            if (!stage.questAnswers) {
                stage.questAnswers = {};
            }
            var oldAnswer = stage.questAnswers[answer.id];
            if (fromClose && oldAnswer && oldAnswer.answer && !answer.answer) {
                continue;
            }
            stage.questAnswers[answer.id] = answer;
        }
        var stagesName = this.stagesNames[stageId];
        utils_1.logServer('Updated answers "' + token + '" for stage "' + stagesName + '". Answers: ' + JSON.stringify(answers));
        this.stateManager.saveAppDB(token, this.teamManager.getAppState(token), function (err) {
            if (!err) {
                utils_1.logServer('Saved new answers "' + token + '" to DB for ' + stagesName);
            }
            else {
                utils_1.logServer('ALERT! Erorr save new answers to DB for ' + stagesName);
            }
        });
        return stage;
    };
    StageManager.prototype.getStagesNames = function () {
        return this.stagesNames;
    };
    StageManager.prototype.closeStage = function (token, stageId) {
        var stage = this.getStage(token, stageId);
        if (!stage || stage.status != 1 /* OPEN */) {
            return this.teamManager.getAppState(token);
        }
        stage.status = 2 /* COMPLETED */;
        stage.closedTime = utils_1.toEkbString(new Date());
        var appState = this.teamManager.getAppState(token);
        var nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == 0 /* LOCKED */) {
            nextStage.status = 1 /* OPEN */;
        }
        if (stage.last) {
            //close bonus if the stage is last
            appState.bonus.status = 2 /* COMPLETED */;
            appState.bonus.closedTime = utils_1.toEkbString(new Date());
        }
        var info = this.stagesNames[stageId] + ' team ' + this.teamManager.findTeamByToken(token).name;
        utils_1.logServer('Closed stage token ' + token + ' stage ' + info);
        appState = this.teamManager.getAppState(token);
        this.stateManager.dbStore.saveAppDB(token, appState, function (err) {
            if (!err) {
                utils_1.logServer('Update app state for ' + info);
            }
            else {
                utils_1.logServer('ALERT: Error update app state for ' + info);
            }
        });
        return appState;
    };
    StageManager.prototype.getQuestionTexts = function (token, stageId) {
        var appState = this.teamManager.getAppState(token);
        var stage = getStageById(appState, stageId);
        if (!stage || stage.status == 0 /* LOCKED */) {
            return null;
        }
        if (stage.status == 3 /* BONUS */ ||
            stageId == "bonus") {
            return data_1.defaultData.bonus.quests;
        }
        var stageInfo = data_1.defaultData.stages[Number(stageId)];
        return stageInfo && stageInfo.quests;
    };
    StageManager.prototype.unlockLastStage = function (tokenId) {
        var _this = this;
        var appState = this.teamManager.getAppState(tokenId);
        var team = this.teamManager.findTeamByToken(tokenId);
        if (!team) {
            utils_1.logServer('Unlock request for incorrect team ' + team.tokenId);
            return false;
        }
        var lastCompletedStage = null;
        var number = 0;
        var stages = appState.stages;
        for (var _i = 0, stages_1 = stages; _i < stages_1.length; _i++) {
            var stage = stages_1[_i];
            number++;
            if (stage.status == 2 /* COMPLETED */) {
                lastCompletedStage = stage;
            }
        }
        if (lastCompletedStage == null) {
            return false;
        }
        lastCompletedStage.status = 1 /* OPEN */;
        utils_1.logServer('Unlocked stage ' + this.stagesNames[lastCompletedStage.id] + ' for ' + tokenId);
        delete lastCompletedStage.closedTime;
        if (number == stages.length &&
            appState.bonus.status == 2 /* COMPLETED */) {
            appState.bonus.status = 3 /* BONUS */;
            delete lastCompletedStage.closedTime;
            utils_1.logServer('Unlocked bonus for ' + tokenId);
        }
        this.stateManager.dbStore.saveAppDB(team.tokenId, appState, function (err) {
            if (!err) {
                utils_1.logServer('Update unlock stage for ' + team.tokenId + "  stage " + _this.stagesNames[lastCompletedStage.id]);
            }
            else {
                utils_1.logServer('ALERT: Error update unlock stage for ' + team.tokenId);
            }
        });
        return true;
    };
    StageManager.prototype.getNextStage = function (appState, stage) {
        if (stage.status == 3 /* BONUS */) {
            return null;
        }
        var showNumber = stage.showNumber;
        var nextStage = appState.stages[showNumber + 1];
        if (!nextStage) {
            return null;
        }
        return nextStage;
    };
    StageManager.prototype.getStage = function (token, stageId) {
        var appState = this.teamManager.getAppState(token);
        if (!appState) {
            return null;
        }
        return getStageById(appState, stageId);
    };
    return StageManager;
}());
exports.StageManager = StageManager;
function getStageById(state, stageId) {
    if (!state) {
        return null;
    }
    for (var _i = 0, _a = state.stages; _i < _a.length; _i++) {
        var stage = _a[_i];
        if (stage.id == stageId) {
            return stage;
        }
    }
    if (stageId == 'bonus') {
        return state.bonus;
    }
    return null;
}
exports.getStageById = getStageById;
function getStagesNames() {
    var result = {};
    var stages = data_1.defaultData.stages;
    for (var i = 0; i < stages.length; i++) {
        var rawStage = stages[i];
        result[String(i)] = rawStage.name;
    }
    result['bonus'] = data_1.defaultData.bonus.name;
    return result;
}
exports.getStagesNames = getStagesNames;
//# sourceMappingURL=StageManager.js.map
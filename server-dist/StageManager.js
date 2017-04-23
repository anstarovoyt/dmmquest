"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = require("./data");
var utils_1 = require("./utils");
var moment = require("moment");
var StageManager = (function () {
    function StageManager(teamManager, stateManager) {
        this.teamManager = teamManager;
        this.stateManager = stateManager;
        this.stagesNames = getStagesNames();
    }
    StageManager.prototype.setAnswers = function (token, stageId, answers, teamBonuses, fromClose) {
        var stage = this.getStage(token, stageId);
        if (!stage) {
            return null;
        }
        if (stage.status == 2 /* COMPLETED */ ||
            stage.status == 7 /* KILLER_COMPLETED */ ||
            stage.status == 4 /* BONUS_COMPLETED */ ||
            stage.status == 0 /* LOCKED */) {
            return null;
        }
        this.updateAnswers(answers, stage, fromClose);
        this.updateTeamBonuses(teamBonuses, stage, fromClose);
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
    StageManager.prototype.updateInitialState = function (tokenId, startDate) {
        var appState = this.teamManager.getAppState(tokenId);
        for (var _i = 0, _a = appState.stages; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.status == 1 /* OPEN */) {
                var _b = this.getTimeInfo(obj), hours = _b.hours, minutes = _b.minutes;
                obj.expectedClosedTime = utils_1.getCloseDate(startDate, hours, minutes);
                break;
            }
        }
        this.stateManager.dbStore.saveAppDB(tokenId, appState, function (err) {
            if (!err) {
                utils_1.logServer('Update app state for ' + tokenId);
            }
            else {
                utils_1.logServer('ALERT: Error update app state for ' + tokenId);
            }
        });
    };
    StageManager.prototype.getTimeInfo = function (obj) {
        var hours = 2;
        var minutes = 30;
        var stageId = Number(obj.id);
        if (stageId != null && !isNaN(stageId)) {
            var rawStage = data_1.defaultData.stages[stageId];
            if (rawStage.timeHours) {
                hours = rawStage.timeHours;
                minutes = rawStage.timeMinutes;
            }
        }
        return { hours: hours, minutes: minutes };
    };
    StageManager.prototype.updateTeamBonuses = function (teamBonuses, stage, fromClose) {
        for (var _i = 0, teamBonuses_1 = teamBonuses; _i < teamBonuses_1.length; _i++) {
            var answer = teamBonuses_1[_i];
            if (!stage.teamBonuses) {
                stage.teamBonuses = {};
            }
            var oldAnswer = stage.teamBonuses[answer.id];
            if (fromClose && oldAnswer && oldAnswer.answer && !answer.answer) {
                continue;
            }
            stage.teamBonuses[answer.id] = answer;
        }
    };
    StageManager.prototype.updateAnswers = function (answers, stage, fromClose) {
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
    };
    StageManager.prototype.getStagesNames = function () {
        return this.stagesNames;
    };
    StageManager.isAllowToClose = function (stage) {
        if (!stage)
            return false;
        if (stage.status == 1 /* OPEN */)
            return true;
        if (stage.status == 6 /* KILLER */)
            return true;
        return stage.status == 3 /* BONUS */ && stage.last;
    };
    StageManager.prototype.closeStage = function (token, stageId) {
        var stage = this.getStage(token, stageId);
        if (!StageManager.isAllowToClose(stage)) {
            return this.teamManager.getAppState(token);
        }
        stage.status = StageManager.getCompleteStatus(stage);
        var currentDateObject = new Date();
        stage.closedTime = utils_1.toEkbOnlyTimeString(currentDateObject);
        var appState = this.teamManager.getAppState(token);
        var nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == 0 /* LOCKED */) {
            nextStage.status = 1 /* OPEN */;
            var _a = this.getTimeInfo(nextStage), hours = _a.hours, minutes = _a.minutes;
            nextStage.expectedClosedTime = utils_1.getCloseDate(currentDateObject, hours, minutes);
        }
        if (stage.last) {
            //close bonus if the stage is last
            // appState.bonus.status = StageStatus.COMPLETED;
            // appState.bonus.closedTime = toEkbString(currentDateObject);
            appState.bonus.last = true;
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
    StageManager.getCompleteStatus = function (stage) {
        if (stage.status == 6 /* KILLER */)
            return 7 /* KILLER_COMPLETED */;
        if (stage.status == 3 /* BONUS */)
            return 4 /* BONUS_COMPLETED */;
        return 2 /* COMPLETED */;
    };
    StageManager.prototype.isSuccessGameResult = function (tokenId) {
        var appState = this.teamManager.getAppState(tokenId);
        var stage = appState.killer;
        if (stage.status == 7 /* KILLER_COMPLETED */) {
            var stageInfo = data_1.defaultData.killer;
            var id = -1;
            var _loop_1 = function (quest) {
                id++;
                var questAnswer = stage.questAnswers[id];
                if (!questAnswer) {
                    return { value: data_1.resultUnSuccess };
                }
                var answer = questAnswer.answer;
                if (typeof quest != 'string') {
                    var matched_1 = false;
                    quest.answer.forEach(function (el) {
                        if (el == answer) {
                            matched_1 = true;
                        }
                    });
                    if (!matched_1) {
                        return { value: false };
                    }
                }
            };
            for (var _i = 0, _a = stageInfo.quests; _i < _a.length; _i++) {
                var quest = _a[_i];
                var state_1 = _loop_1(quest);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            return true;
        }
        return undefined;
    };
    StageManager.prototype.getGameResult = function (tokenId) {
        var result = this.isSuccessGameResult(tokenId);
        if (result === undefined)
            return '';
        return result ? data_1.resultSuccess : data_1.resultUnSuccess;
    };
    StageManager.prototype.getQuestionTexts = function (token, stageId) {
        var appState = this.teamManager.getAppState(token);
        var stage = getStageById(appState, stageId);
        if (!stage || stage.status == 0 /* LOCKED */) {
            return null;
        }
        if (stage.status == 3 /* BONUS */ ||
            stageId == 'bonus') {
            var result_1 = [];
            var _loop_2 = function (stage_1) {
                if (stage_1.status == 1 /* OPEN */ ||
                    stage_1.status == 0 /* LOCKED */ ||
                    stage_1.status == 2 /* COMPLETED */) {
                    var stageNumber = Number(stage_1.id);
                    if (stageNumber != null) {
                        var currentStage_1 = data_1.defaultData.stages[stageNumber];
                        if (currentStage_1.bonuses) {
                            currentStage_1.bonuses.forEach(function (el) {
                                result_1.push({
                                    stageName: currentStage_1.name,
                                    quest: el,
                                    show: true
                                });
                            });
                        }
                    }
                }
            };
            for (var _i = 0, _a = appState.stages; _i < _a.length; _i++) {
                var stage_1 = _a[_i];
                _loop_2(stage_1);
            }
            var quests = data_1.defaultData.bonus.quests;
            if (quests) {
                quests.forEach(function (el) { return result_1.push({ quest: el, show: true }); });
            }
            return { texts: result_1 };
        }
        if (stage.status == 6 /* KILLER */ || stageId == 'killer') {
            return {
                texts: data_1.defaultData.killer.quests.map(function (el) {
                    return { quest: el, show: true };
                })
            };
        }
        var stageInfo = data_1.defaultData.stages[Number(stageId)];
        if (!stageInfo)
            return;
        return {
            texts: stageInfo.quests.map(function (el) {
                return { quest: el, show: true };
            }),
            description: stageInfo.description
        };
    };
    StageManager.prototype.geStagePenalties = function (team, appState) {
        if (!team.endQuestDate)
            return {};
        var result = {};
        for (var _i = 0, _a = appState.stages; _i < _a.length; _i++) {
            var stage = _a[_i];
            var expectedClosedTime = stage.expectedClosedTime;
            if (expectedClosedTime) {
                //has expected time
                var indexOfSeparator = expectedClosedTime.indexOf(':');
                var hours = expectedClosedTime.substr(0, indexOfSeparator);
                var id = stage.id;
                var stageIdNumber = Number(id);
                if (stageIdNumber == null) {
                    continue;
                }
                var rawStageInfo = data_1.defaultData.stages[id];
                var timeHours = rawStageInfo.timeHours;
                var timeMinutes = rawStageInfo.timeMinutes;
                var actualClosedTime = this.getActualCloseTime(team, stage);
                var expectedDate = moment(expectedClosedTime, 'HH:mm');
                var actualDate = moment(actualClosedTime, 'HH:mm');
                var stageMinutes = actualDate.diff(expectedDate, 'minutes');
                if (stageMinutes > 0) {
                    result[stage.id] = -((Math.floor(((stageMinutes - 0.1)) / 10) + 1) / 2);
                }
            }
        }
        return result;
    };
    StageManager.prototype.getActualCloseTime = function (team, stage) {
        if (stage.closedTime) {
            return stage.closedTime;
        }
        var endQuestDate = team.endQuestDate;
        return utils_1.toEkbOnlyTimeString(endQuestDate);
    };
    StageManager.prototype.getFullStagesInfo = function (team) {
        var result = {};
        var appState = this.teamManager.getAppState(team.tokenId);
        var stages = data_1.defaultData.stages;
        for (var i = 0; i < stages.length; i++) {
            var stage = stages[i];
            this.processStage(result, stage, String(i));
        }
        this.processStage(result, data_1.defaultData.killer, 'killer');
        var bonusStage = data_1.defaultData.bonus;
        var bonusAnswers = [];
        var bonusInfo = {
            realName: bonusStage.name,
            questsAnswer: bonusAnswers
        };
        for (var _i = 0, _a = appState.stages; _i < _a.length; _i++) {
            var stage = _a[_i];
            var stageNumber = Number(stage.id);
            if (stageNumber != null && !isNaN(stageNumber)) {
                var rawStage = data_1.defaultData.stages[stageNumber];
                if (rawStage.bonuses) {
                    for (var _b = 0, _c = rawStage.bonuses; _b < _c.length; _b++) {
                        var bonus = _c[_b];
                        this.processQuest(bonus, bonusAnswers);
                    }
                }
            }
        }
        for (var _d = 0, _e = bonusStage.quests; _d < _e.length; _d++) {
            var bonus = _e[_d];
            this.processQuest(bonus, bonusAnswers);
        }
        result['bonus'] = bonusInfo;
        return result;
    };
    StageManager.prototype.processStage = function (result, stage, id) {
        var answers = [];
        var info = {
            realName: stage.internalName ? (stage.internalName + ' (' + stage.name + ')') : stage.name,
            questsAnswer: answers
        };
        var quests = stage.quests;
        for (var i = 0; i < quests.length; i++) {
            var quest = quests[i];
            this.processQuest(quest, answers);
        }
        result[id] = info;
    };
    StageManager.prototype.processQuest = function (quest, answers) {
        if (typeof quest == 'string' || !quest.answer) {
            answers.push({
                answers: [],
                type: typeof quest == 'string' ? undefined : quest.type
            });
        }
        else {
            answers.push({
                type: quest.type,
                answers: quest.answer ? quest.answer : []
            });
        }
    };
    StageManager.prototype.unlockStage = function (tokenId, stageId) {
        var appState = this.teamManager.getAppState(tokenId);
        var team = this.teamManager.findTeamByToken(tokenId);
        if (!team) {
            utils_1.logServer('Unlock request for incorrect team ' + tokenId);
            return false;
        }
        if (stageId) {
            if (stageId == 'bonus' && appState.bonus.status == 4 /* BONUS_COMPLETED */) {
                this.unlock(appState.bonus, tokenId, team, appState, 3 /* BONUS */);
            }
            return;
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
        this.unlock(lastCompletedStage, tokenId, team, appState, 1 /* OPEN */);
        return true;
    };
    StageManager.prototype.unlock = function (stage, tokenId, team, appState, openStatus) {
        var _this = this;
        stage.status = openStatus;
        var stagesName = this.stagesNames[stage.id];
        utils_1.logServer('Unlocked stage ' + (stagesName ? openStatus : stage.id) + ' for ' + tokenId);
        delete stage.closedTime;
        this.stateManager.dbStore.saveAppDB(team.tokenId, appState, function (err) {
            if (!err) {
                utils_1.logServer('Update unlock stage for ' + team.tokenId + '  stage ' + _this.stagesNames[stage.id]);
            }
            else {
                utils_1.logServer('ALERT: Error update unlock stage for ' + team.tokenId);
            }
        });
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
    StageManager.prototype.getIntro = function () {
        return data_1.intro;
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
    if (stageId == 'bonus' || stageId == 'killer') {
        return state[stageId];
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
    result['killer'] = data_1.defaultData.killer.name;
    return result;
}
exports.getStagesNames = getStagesNames;
//# sourceMappingURL=StageManager.js.map
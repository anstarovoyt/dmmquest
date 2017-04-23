import {TeamManager} from './TeamManager';
import {defaultData, intro, QuestText, RawStage, resultSuccess, resultUnSuccess} from './data';
import {getCloseDate, logServer, toEkbString, toEkbOnlyTimeString} from './utils';
import {StateManager} from './StateManager';


export class StageManager {

    constructor(private teamManager: TeamManager, private stateManager: StateManager) {
    }


    private stagesNames: {
        [stageId: string]: string;
    } = getStagesNames();


    setAnswers(token: string, stageId: string, answers: QuestAnswer[], teamBonuses: QuestAnswer[], fromClose: boolean) {
        let stage: Stage = this.getStage(token, stageId);
        if (!stage) {
            return null;
        }
        if (stage.status == StageStatus.COMPLETED ||
            stage.status == StageStatus.KILLER_COMPLETED ||
            stage.status == StageStatus.BONUS_COMPLETED ||
            stage.status == StageStatus.LOCKED) {
            return null;
        }

        this.updateAnswers(answers, stage, fromClose);
        this.updateTeamBonuses(teamBonuses, stage, fromClose);

        const stagesName = this.stagesNames[stageId];
        logServer('Updated answers "' + token + '" for stage "' + stagesName + '". Answers: ' + JSON.stringify(answers));

        this.stateManager.saveAppDB(token, this.teamManager.getAppState(token), (err) => {
            if (!err) {
                logServer('Saved new answers "' + token + '" to DB for ' + stagesName);
            } else {
                logServer('ALERT! Erorr save new answers to DB for ' + stagesName);
            }
        });
        return stage;
    }

    updateInitialState(tokenId: string, startDate: Date) {
        const appState = this.teamManager.getAppState(tokenId);
        for (let obj of appState.stages) {
            if (obj.status == StageStatus.OPEN) {
                let {hours, minutes} = this.getTimeInfo(obj);

                obj.expectedClosedTime = getCloseDate(startDate, hours, minutes);
                break;
            }
        }

        this.stateManager.dbStore.saveAppDB(tokenId, appState, (err) => {
            if (!err) {
                logServer('Update app state for ' + tokenId);
            } else {
                logServer('ALERT: Error update app state for ' + tokenId);
            }
        });
    }

    private getTimeInfo(obj) {
        let hours = 2;
        let minutes = 30;
        let stageId = Number(obj.id);
        if (stageId) {
            let rawStage = defaultData.stages[stageId];
            if (rawStage.timeHours) {
                hours = rawStage.timeHours;
                minutes = rawStage.timeMinutes;
            }
        }
        return {hours, minutes};
    }

    private updateTeamBonuses(teamBonuses: QuestAnswer[], stage: Stage, fromClose: boolean) {
        for (let answer of teamBonuses) {
            if (!stage.teamBonuses) {
                stage.teamBonuses = {};
            }

            const oldAnswer = stage.teamBonuses[answer.id];
            if (fromClose && oldAnswer && oldAnswer.answer && !answer.answer) {
                continue;
            }

            stage.teamBonuses[answer.id] = answer;
        }
    }

    private updateAnswers(answers: QuestAnswer[], stage: Stage, fromClose: boolean) {
        for (let answer of answers) {
            if (!stage.questAnswers) {
                stage.questAnswers = {};
            }

            const oldAnswer = stage.questAnswers[answer.id];
            if (fromClose && oldAnswer && oldAnswer.answer && !answer.answer) {
                continue;
            }

            stage.questAnswers[answer.id] = answer;
        }
    }

    getStagesNames() {
        return this.stagesNames;
    }

    private static isAllowToClose(stage: Stage) {
        if (!stage) return false;
        if (stage.status == StageStatus.OPEN) return true;
        if (stage.status == StageStatus.KILLER) return true;

        return stage.status == StageStatus.BONUS && stage.last;
    }

    closeStage(token: string, stageId: string): AppState {
        let stage: Stage = this.getStage(token, stageId);
        if (!StageManager.isAllowToClose(stage)) {
            return this.teamManager.getAppState(token);
        }

        stage.status = StageManager.getCompleteStatus(stage);
        let currentDateObject = new Date();
        stage.closedTime = toEkbOnlyTimeString(currentDateObject);
        let appState = this.teamManager.getAppState(token);
        const nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
            let {hours, minutes} = this.getTimeInfo(nextStage);
            nextStage.expectedClosedTime = getCloseDate(currentDateObject, hours, minutes);
        }

        if (stage.last) {
            //close bonus if the stage is last
            // appState.bonus.status = StageStatus.COMPLETED;
            // appState.bonus.closedTime = toEkbString(currentDateObject);
            appState.bonus.last = true;
        }

        const info = this.stagesNames[stageId] + ' team ' + this.teamManager.findTeamByToken(token).name;
        logServer('Closed stage token ' + token + ' stage ' + info);

        appState = this.teamManager.getAppState(token);

        this.stateManager.dbStore.saveAppDB(token, appState, (err) => {
            if (!err) {
                logServer('Update app state for ' + info);
            } else {
                logServer('ALERT: Error update app state for ' + info);
            }
        });
        return appState;
    }

    private static getCompleteStatus(stage: Stage) {
        if (stage.status == StageStatus.KILLER)  return StageStatus.KILLER_COMPLETED;
        if (stage.status == StageStatus.BONUS)  return StageStatus.BONUS_COMPLETED;

        return StageStatus.COMPLETED;
    }

    private isSuccessGameResult(tokenId: string) {
        const appState = this.teamManager.getAppState(tokenId);
        let stage = appState.killer;
        if (stage.status == StageStatus.KILLER_COMPLETED) {
            const stageInfo: RawStage = defaultData.killer;
            let id = -1;
            for (let quest of stageInfo.quests) {
                id++;
                let questAnswer: QuestAnswer = stage.questAnswers[id];
                if (!questAnswer) {
                    return resultUnSuccess;
                }

                let answer = questAnswer.answer;

                if (typeof quest != 'string') {
                    let matched = false;
                    quest.answer.forEach(el => {
                        if (el == answer) {
                            matched = true;
                        }
                    });
                    if (!matched) {
                        return false;
                    }
                }
            }

            return true;
        }


        return undefined;
    }


    getGameResult(tokenId: string): string {
        let result = this.isSuccessGameResult(tokenId);
        if (result === undefined) return '';

        return result ? resultSuccess : resultUnSuccess;

    }

    getQuestionTexts(token: string, stageId: string): { texts: { quest: QuestText, show?: boolean, stageName?: string }[], description?: string } {
        const appState = this.teamManager.getAppState(token);
        let stage = getStageById(appState, stageId);
        if (!stage || stage.status == StageStatus.LOCKED) {
            return null;
        }

        if (stage.status == StageStatus.BONUS ||
            stageId == 'bonus') {
            let result: { quest: QuestText, show?: boolean, stageName?: string }[] = [];
            for (let stage of appState.stages) {
                if (stage.status == StageStatus.OPEN ||
                    stage.status == StageStatus.LOCKED ||
                    stage.status == StageStatus.COMPLETED) {
                    let stageNumber = Number(stage.id);
                    if (stageNumber != null) {
                        let currentStage = defaultData.stages[stageNumber];
                        if (currentStage.bonuses) {
                            currentStage.bonuses.forEach(el => {
                                result.push({
                                    stageName: currentStage.name,
                                    quest: el,
                                    show: true
                                });
                            });
                        }
                    }
                }
            }

            let quests = defaultData.bonus.quests;
            if (quests) {
                quests.forEach(el => result.push({quest: el, show: true}));
            }

            return {texts: result};
        }

        if (stage.status == StageStatus.KILLER || stageId == 'killer') {
            return {
                texts: defaultData.killer.quests.map(el => {
                    return {quest: el, show: true};
                })
            };
        }

        const stageInfo: RawStage = defaultData.stages[Number(stageId)];
        if (!stageInfo) return;


        return {
            texts: stageInfo.quests.map(el => {
                return {quest: el, show: true};
            }),
            description: stageInfo.description
        };
    }

    getFullStagesInfo(team: Team) {
        let result: FullStagesInfo = {};
        const appState = this.teamManager.getAppState(team.tokenId);

        let stages = defaultData.stages;
        for (let i = 0; i < stages.length; i++) {
            let stage = stages[i];
            this.processStage(result, stage, String(i));
        }

        this.processStage(result, defaultData.killer, 'killer');

        let bonusStage = defaultData.bonus;
        let bonusAnswers: FullQuestAnswer[] = [];
        let bonusInfo: FullStageInfo = {
            realName: bonusStage.name,
            questsAnswer: bonusAnswers
        };

        for (let stage of appState.stages) {
            let stageNumber = Number(stage.id);

            if (stageNumber) {
                let rawStage = defaultData.stages[stageNumber];
                if (rawStage.bonuses) {
                    for (let bonus of rawStage.bonuses) {
                        this.processQuest(bonus, bonusAnswers);
                    }
                }
            }
        }
        for (let bonus of bonusStage.quests) {
            this.processQuest(bonus, bonusAnswers);
        }
        result['bonus'] = bonusInfo;

        return result;
    }


    private processStage(result: FullStagesInfo, stage: RawStage, id: string) {
        let answers: FullQuestAnswer[] = [];
        let info: FullStageInfo = {
            realName: stage.internalName ? (stage.internalName + ' (' + stage.name + ')') : stage.name,
            questsAnswer: answers
        };

        let quests = stage.quests;
        for (let i = 0; i < quests.length; i++) {
            let quest: QuestText = quests[i];
            this.processQuest(quest, answers);
        }

        result[id] = info;
    }

    private processQuest(quest: QuestText, answers: FullQuestAnswer[]) {
        if (typeof quest == 'string' || !quest.answer) {
            answers.push({
                answers: [],
                type: typeof quest == 'string' ? undefined : quest.type
            });
        } else {
            answers.push({
                type: quest.type,
                answers: quest.answer ? quest.answer : []
            });
        }
    }

    unlockStage(tokenId: string, stageId?: string): boolean {

        const appState = this.teamManager.getAppState(tokenId);
        let team = this.teamManager.findTeamByToken(tokenId);
        if (!team) {
            logServer('Unlock request for incorrect team ' + tokenId);
            return false;
        }

        if (stageId) {
            if (stageId == 'bonus' && appState.bonus.status == StageStatus.BONUS_COMPLETED) {
                this.unlock(appState.bonus, tokenId, team, appState, StageStatus.BONUS);
            }

            return;
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
        this.unlock(lastCompletedStage, tokenId, team, appState, StageStatus.OPEN);

        return true;
    }

    private unlock(stage: Stage, tokenId: string, team: Team, appState: AppState, openStatus: StageStatus) {
        stage.status = openStatus;
        let stagesName = this.stagesNames[stage.id];
        logServer('Unlocked stage ' + (stagesName ? openStatus : stage.id) + ' for ' + tokenId);
        delete stage.closedTime;

        this.stateManager.dbStore.saveAppDB(team.tokenId, appState, (err) => {
            if (!err) {
                logServer('Update unlock stage for ' + team.tokenId + '  stage ' + this.stagesNames[stage.id]);
            } else {
                logServer('ALERT: Error update unlock stage for ' + team.tokenId);
            }
        });
    }

    getNextStage(appState: AppState, stage: Stage): Stage {
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

    getStage(token: string, stageId: string) {
        let appState = this.teamManager.getAppState(token);

        if (!appState) {
            return null;
        }

        return getStageById(appState, stageId);
    }

    getIntro() {
        return intro;
    }
}

export function getStageById(state: AppState, stageId: string) {
    if (!state) {
        return null;
    }
    for (const stage of state.stages) {
        if (stage.id == stageId) {
            return stage;
        }
    }

    if (stageId == 'bonus' || stageId == 'killer') {
        return state[stageId];
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
    result['killer'] = defaultData.killer.name;

    return result;
}
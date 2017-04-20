import {TeamManager} from './TeamManager';
import {defaultData, intro, QuestText, RawStage, resultSuccess, resultUnSuccess} from './data';
import {logServer, toEkbString} from './utils';
import {StateManager} from './StateManager';


export class StageManager {

    constructor(private teamManager: TeamManager, private stateManager: StateManager) {
    }


    private stagesNames: {
        [stageId: string]: string;
    } = getStagesNames();


    setAnswers(token: string, stageId: string, answers: QuestAnswer[], fromClose: boolean) {
        let stage: Stage = this.getStage(token, stageId);
        if (!stage) {
            return null;
        }
        if (stage.status == StageStatus.COMPLETED ||
            stage.status == StageStatus.KILLER_COMPLETED ||
            stage.status == StageStatus.LOCKED) {
            return null;
        }

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

    getStagesNames() {
        return this.stagesNames;
    }


    closeStage(token: string, stageId: string): AppState {
        let stage: Stage = this.getStage(token, stageId);
        if (!stage || (stage.status != StageStatus.OPEN && stage.status != StageStatus.KILLER)) {
            return this.teamManager.getAppState(token);
        }

        stage.status = stage.status == StageStatus.KILLER ? StageStatus.KILLER_COMPLETED : StageStatus.COMPLETED;
        stage.closedTime = toEkbString(new Date());
        let appState = this.teamManager.getAppState(token);
        const nextStage = this.getNextStage(appState, stage);
        if (nextStage && nextStage.status == StageStatus.LOCKED) {
            nextStage.status = StageStatus.OPEN;
        }

        if (stage.last) {
            //close bonus if the stage is last
            appState.bonus.status = StageStatus.COMPLETED;
            appState.bonus.closedTime = toEkbString(new Date());
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


    getGameResult(tokenId: string): string {
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
                        return resultUnSuccess;
                    }
                }
            }

            return resultSuccess;
        }


        return '';
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
            let quests = defaultData.bonus.quests;
            if (quests) {
                quests.forEach(el => result.push({quest: el, show: true}));
            }
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

    unlockLastStage(tokenId: string): boolean {

        const appState = this.teamManager.getAppState(tokenId);
        let team = this.teamManager.findTeamByToken(tokenId);
        if (!team) {
            logServer('Unlock request for incorrect team ' + team.tokenId);
            return false;
        }
        let lastCompletedStage: Stage = null;
        let number = 0;
        const stages = appState.stages;
        for (let stage of stages) {
            if (stage.status == StageStatus.KILLER || stage.status == StageStatus.KILLER_COMPLETED) {
                break;
            }

            number++;
            if (stage.status == StageStatus.COMPLETED) {
                lastCompletedStage = stage;
            }

        }

        if (lastCompletedStage == null) {
            return false;
        }

        lastCompletedStage.status = StageStatus.OPEN;
        logServer('Unlocked stage ' + this.stagesNames[lastCompletedStage.id] + ' for ' + tokenId);
        delete lastCompletedStage.closedTime;

        if (number == stages.length &&
            appState.bonus.status == StageStatus.COMPLETED) {
            appState.bonus.status = StageStatus.BONUS;
            delete lastCompletedStage.closedTime;
            logServer('Unlocked bonus for ' + tokenId);
        }

        this.stateManager.dbStore.saveAppDB(team.tokenId, appState, (err) => {
            if (!err) {
                logServer('Update unlock stage for ' + team.tokenId + '  stage ' + this.stagesNames[lastCompletedStage.id]);
            } else {
                logServer('ALERT: Error update unlock stage for ' + team.tokenId);
            }
        });

        return true;
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
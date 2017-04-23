import * as React from 'react';

export class StageElementComponent extends React.Component<{ info: TeamInfo, stage: Stage }, {}> {

    render() {
        const stage = this.props.stage;
        const stageNumber = this.getStageNumber(stage);

        let teamInfo: TeamInfo = this.props.info;
        let stageInfo = teamInfo.stagesInfo[stage.id];


        return <span key={stage.id}>
                <b>Этап {stageNumber}</b>: {stageInfo.realName}
            — <b>{this.getStageStatusText(stage)}</b>
            <div>
                <i>&nbsp;&nbsp;&nbsp;<b>{'Штраф: '}</b></i> {this.getPenalty(teamInfo, stage)}
                {this.getAnswers(stage)}
            </div>
                </span>;
    }

    private getPenalty(teamInfo: TeamInfo, stage: Stage) {
        let stagePenalties = teamInfo.stagePenalties;
        if (stagePenalties) {
            let stagePenalty = stagePenalties[stage.id];
            if (stagePenalty != null && stagePenalty < 0) {
                return <span>{String(stagePenalty)}</span>;
            }
        }

        return <span>{'Нет штрафа'}</span>;
    }

    private getStageNumber(stage: Stage): string {
        if (stage.status == StageStatus.BONUS || stage.status == StageStatus.BONUS_COMPLETED) return 'Бонус';
        if (stage.status == StageStatus.KILLER || stage.status == StageStatus.KILLER_COMPLETED) return 'Killer';

        return String(Number(stage.id) + 1);
    }

    getStageStatusText(stage: Stage) {
        const status = stage.status;
        if (status == StageStatus.OPEN) {
            let res = 'В процессе';

            if (stage.expectedClosedTime) {
                res += '. Срок сдачи: ' + stage.expectedClosedTime;
            }
            return res;
        }

        if (status == StageStatus.COMPLETED ||
            status == StageStatus.BONUS_COMPLETED ||
            status == StageStatus.KILLER_COMPLETED) {
            let res = 'Сдан';
            if (status == StageStatus.COMPLETED) {
                if (stage.closedTime) {
                    res += '. Время: ' + stage.closedTime;
                }
                if (stage.expectedClosedTime) {
                    res += '. Срок сдачи: ' + stage.expectedClosedTime;
                }
            }
            return res;
        }

        if (status == StageStatus.BONUS) {
            return 'Бонус';
        }

        if (status == StageStatus.KILLER) {
            return 'Killer';
        }

        return 'Не открыт';
    }

    getAnswers(stage: Stage) {
        const result = [];

        let teamInfo = this.props.info;
        let stageInfo: FullStageInfo = teamInfo.stagesInfo[stage.id];
        if (!stageInfo) {
            return [<div>
                Нет информации об этапе
            </div>];
        }
        const questAnswers: { [p: number]: QuestAnswer } = stage.questAnswers == null ? {} : stage.questAnswers;
        const teamBonuses: { [p: number]: QuestAnswer } = stage.teamBonuses == null ? {} : stage.teamBonuses;
        if (stageInfo) {
            for (let answerId = 0; answerId < stageInfo.questsAnswer.length; answerId++) {
                const fullQuestAnswer: FullQuestAnswer = stageInfo.questsAnswer[answerId];

                let questAnswer = questAnswers[answerId];
                let teamBonus = teamBonuses[answerId];
                result.push(this.createAnswerComponent(fullQuestAnswer, answerId, questAnswer, teamBonus));
            }
        }

        return result;
    }

    private isUserAnswerRight(answer: string | null, answers: string[]) {
        if (!answer) return false;
        let lowCase = answer.toLocaleLowerCase();
        for (let obj of answers) {

            if (lowCase.indexOf(obj.toLocaleLowerCase()) != -1) return true;
        }

        return false;
    }

    private createAnswerComponent(obj: FullQuestAnswer, answerId: number, userAnswer: QuestAnswer | null, teamBonus: QuestAnswer | null) {
        let isUserAnswerRight = userAnswer ? this.isUserAnswerRight(userAnswer.answer, obj.answers) : false;

        return <div key={answerId}>
            <i>&nbsp;&nbsp;&nbsp;Вопрос {Number(answerId) + 1}</i>

            {userAnswer ?
                <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {isUserAnswerRight ? '✓ ' : ' '}<span
                    className="answer-text-title">Ответ</span>: {this.getUserAnswer(answerId, obj.type, userAnswer.answer, 'Answer')}
                    <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {isUserAnswerRight ? '✓ ' : ' '}<span
                    className="answer-text-title">Правильный ответ</span>: {this.getFullAnswers(obj.answers)}
                </div>
                : ''}
            {teamBonus || obj.type == QuestType.TEXT_NO_TEAM_BONUS ?
                <div>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {obj.type != QuestType.TEXT_NO_TEAM_BONUS ? '✓ ' : ' '}<span
                    className="answer-text-title">Бонус за командность</span>: {obj.type == QuestType.TEXT_NO_TEAM_BONUS ?
                    <span>{'Вручную'}</span> :
                    this.getUserAnswer(answerId, QuestType.UPLOAD, teamBonus.answer, 'TeamBonus')}
                </div> : ''}

        </div>;

    }

    private getFullAnswers(answers: string[]) {
        if (answers.length == 0) {
            return <span>"Нет ответа"</span>;
        }

        return <span>{answers.join(', ')}</span>;
    }

    private getUserAnswer(answerId: number, type: QuestType, userAnswer: string, kind: string) {
        if (type == QuestType.UPLOAD || type == QuestType.UPLOAD_5) {
            let split = userAnswer.split('\n');
            return <span>{split.map((el, i) => {
                return <span>&nbsp;<a key={'refToFile_' + answerId + '_' + i}
                                      target="_blank"
                                      style={{textDecorationLine: 'underline', display: 'inline'}}
                                      href={el}>{kind} {i + 1}</a></span>;
            })}</span>;
        }

        return <span>{userAnswer}</span>;
    }
};
;
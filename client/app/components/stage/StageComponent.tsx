import * as React from 'react';
import {PropTypes} from 'react';
import {questService} from '../../state/QuestService';
import {LoadingComponent} from '../common/LoadingComponent';
import {AnswerWithBonus, NestedValue, QuestComponent} from './QuestionComponent';
import {complete} from '../../communitation/Dispatcher';
import {auth} from '../../authentication/AuthService';
import {appStateService} from '../../state/AppStateService';

const Link = require('react-router/lib/Link');

const enum LoadState {
    NOT_LOADED,
    LOADED,
    ERROR
}


export class StageComponent extends React.Component<{ stage: Stage },
    {
        questTexts?: QuestTexts,
        stage?: Stage,
        isEnableSave: boolean,
        savedMark: ActionState,
        loadState: LoadState
    }> {

    static contextTypes = {
        history: PropTypes.object.isRequired
    };

    private timeOutMarker = null;

    private popupText = '';

    nestedValue: NestedValue = {};

    constructor(props: any, context) {
        super(props, context);
        this.state = {
            isEnableSave: true,
            savedMark: ActionState.NO,
            loadState: LoadState.NOT_LOADED
        };
    }


    componentWillUnmount(): void {
        if (this.timeOutMarker != null) {
            clearTimeout(this.timeOutMarker);
            this.timeOutMarker = null;
        }
    }

    componentDidMount() {
        const currentStage = this.getCurrentStage();
        questService.getAsyncQuestTexts(currentStage, (res) => {
            if (res.success) {
                this.setState({
                    questTexts: res.texts,
                    stage: currentStage,
                    isEnableSave: true,
                    savedMark: ActionState.NO,
                    loadState: LoadState.LOADED
                });
            } else {
                this.setState({
                    questTexts: res.texts,
                    stage: currentStage,
                    isEnableSave: true,
                    savedMark: ActionState.NO,
                    loadState: LoadState.ERROR
                });
            }
        });
    }

    private getCurrentStage() {
        return this.props.stage;
    }


    private getTitleText(currentStage: Stage) {
        if (currentStage.status == StageStatus.BONUS && currentStage.last) {
            return <h4>Для завершения квеста нажмите кнопку "Завершить квест"</h4>;
        }

        if (currentStage.status == StageStatus.KILLER) {
            return <h4>У вас будет только одна попытка проверить свою догадку, используйте ее с умом</h4>;
        }

        if (currentStage.status == StageStatus.OPEN && currentStage.expectedClosedTime) {
            return <h4>Закрыть до {currentStage.expectedClosedTime}</h4>;
        }


        return <h4/>;
    }

    render() {
        const currentStage: Stage = this.getCurrentStage();

        const state = this.state;
        const stageName = appStateService.getStageName(currentStage);
        const questTexts: QuestTexts = state.questTexts;
        if (questTexts) {
            const quests = questTexts.quests.map(item => {
                return <QuestComponent savedValues={this.nestedValue} key={item.id} quest={item}
                                       stage={this.props.stage}/>;
            });
            const isCompletedLevel = currentStage.status == StageStatus.COMPLETED ||
                currentStage.status == StageStatus.KILLER_COMPLETED ||
                currentStage.status == StageStatus.BONUS_COMPLETED;
            const buttonStyle = 'btn' + (isCompletedLevel ? ' btn-success' : ' btn-info');


            const savedMark = this.state.savedMark;
            const savedHtmlClass = 'done-mark' + (savedMark == ActionState.ERROR || savedMark == ActionState.SAVED ? ' view' : '');


            if (savedMark == ActionState.ERROR) {
                this.popupText = 'Ошибка при отправке';
            } else if (savedMark == ActionState.SAVED) {
                this.popupText = 'Ответы сохранены';
            }

            return (
                <div className="row">
                    <div className="col-lg-12">
                        <h1><Link to="/">
                            <span className="glyphicon glyphicon-arrow-left"></span>
                        </Link>
                            <span>{stageName} <br/>
                                { this.getTitleText(currentStage) }</span></h1>
                        {this.getDescription(currentStage, questTexts)}

                        {quests}
                    </div>
                    {currentStage.status == StageStatus.BONUS && !currentStage.last ?
                        '' :
                        <div className="col-lg-12 save-level">
                            <p className="lead"></p>
                            <div className="input-group">
                            <span className="input-group-btn">
                              <button className={buttonStyle}
                                      type="button"
                                      onClick={this.saveAnswers.bind(this)}
                                      disabled={!this.state.isEnableSave || isCompletedLevel}>
                                  { this.getButtonName(currentStage, isCompletedLevel) }
                                  {savedMark == ActionState.NO ? '' :
                                      <span className={savedHtmlClass}>{this.popupText}</span>}
                              </button>
                            </span>
                            </div>
                        </div>
                    }
                </div>
            );
        }

        return (
            <div className="row">
                <div className="col-lg-12">
                    <h1><Link to="/">
                        <span className="glyphicon glyphicon-arrow-left"></span>
                    </Link>
                    </h1>
                    <br/>
                    <br/>
                    {this.state.loadState == LoadState.ERROR ?
                        <span>Ошибка загрузки данных. Попробуйте обновить страницу</span> : <LoadingComponent />}
                </div>
            </div>
        );
    }

    getButtonName(currentStage: Stage, isCompletedLevel: boolean) {
        if (currentStage && currentStage.status == StageStatus.BONUS) {
            return 'Завершить квест';
        }

        if (currentStage && currentStage.status == StageStatus.KILLER) {
            return 'Проверить!';
        }

        return isCompletedLevel ? 'Этап сдан' : currentStage.last ? 'Сдать этап и продолжить собирать бонусы' : 'Сохранить ответы и сдать этап';
    }

    saveAnswers() {
        let stage = this.props.stage;
        if (!stage) {
            return;
        }


        if ((stage.status == StageStatus.OPEN || stage.status == StageStatus.BONUS) && !window.confirm('Вы действительно хотите завершить этап?')) {
            return;
        }
        this.completeStage(stage);
    }

    completeStage(stage: Stage) {
        const {answers, teamBonuses, token} = this.saveStateWithAnswers();

        complete({
            stageId: stage.id,
            token: token,
            answers: answers,
            teamBonuses: teamBonuses,
        }, (r) => {
            if (!r.error) {
                appStateService.setState(r.res);
                if (stage.status != StageStatus.BONUS) {
                    this.redirectTo(stage);
                    return;
                }


                this.setState({
                    questTexts: this.state.questTexts,
                    stage: this.state.stage,
                    isEnableSave: true,
                    savedMark: ActionState.SAVED,
                    loadState: this.state.loadState
                });

            } else {
                this.setState({
                    questTexts: this.state.questTexts,
                    stage: this.state.stage,
                    isEnableSave: true,
                    savedMark: ActionState.ERROR,
                    loadState: this.state.loadState
                });
            }

            this.timeOutMarker = setTimeout(() => {
                this.setState({
                    questTexts: this.state.questTexts,
                    stage: this.state.stage,
                    isEnableSave: true,
                    savedMark: ActionState.NO,
                    loadState: this.state.loadState
                });

                this.timeOutMarker = null;
            }, 1000);
        });
    }

    redirectTo(stage: Stage) {
        this.context['history'].push(stage.last && stage.status == StageStatus.OPEN ? '/bonus' : '/');
    }

    private saveStateWithAnswers() {
        const answers: QuestAnswer[] = [];
        const teamBonuses: QuestAnswer[] = [];
        const nestedValue: NestedValue = this.nestedValue;
        for (let value in nestedValue) {
            if (nestedValue.hasOwnProperty(value)) {
                let current: AnswerWithBonus = nestedValue[value];

                answers.push({
                    id: Number(value),
                    answer: current.answer
                });
                if (current.teamBonus) {
                    teamBonuses.push({
                        id: Number(value),
                        answer: current.teamBonus
                    });
                }
            }
        }


        const token = auth.getToken();

        this.setState({
            questTexts: this.state.questTexts,
            stage: this.state.stage,
            isEnableSave: false,
            savedMark: ActionState.NO,
            loadState: this.state.loadState
        });

        return {answers, teamBonuses, token};
    }

    private getDescription(currentStage: Stage, questTexts: QuestTexts) {
        let description = questTexts.stageDescription;
        if (!description) return <div/>;
        return <div className="row">
            <div className="col-xs-18 col-md-12">
                <h4>Описание</h4>
                <div className="status-float-center" dangerouslySetInnerHTML={{__html: description}}/>
                <br/>
            </div>
        </div>;
    }
}



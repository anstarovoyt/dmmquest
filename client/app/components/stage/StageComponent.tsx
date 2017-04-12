import * as React from "react";
import {PropTypes} from "react";
import {questService} from "../../state/QuestService";
import {LoadingComponent} from "../common/LoadingComponent";
import {QuestComponent} from "./QuestionComponent";
import {complete} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";

var Link = require('react-router/lib/Link');

const enum LoadState {
    NOT_LOADED,
    LOADED,
    ERROR
}

export class StageComponent extends React.Component<{stage:Stage},
    {questTexts?:QuestTexts,
        stage?:Stage,
        isEnableSave:boolean,
        savedMark:ActionState,
        loadState:LoadState}> {

    static contextTypes = {
        history: PropTypes.object.isRequired
    };

    private timeOutMarker = null;

    private popupText = "";

    nestedValue = {};

    constructor(props:any, context) {
        super(props, context);
        this.state = {
            isEnableSave: true,
            savedMark: ActionState.NO,
            loadState: LoadState.NOT_LOADED
        }
    }


    componentWillUnmount():void {
        if (this.timeOutMarker != null) {
            clearTimeout(this.timeOutMarker);
            this.timeOutMarker = null;
        }
    }

    componentDidMount() {
        var currentStage = this.getCurrentStage();
        questService.getAsyncQuestTexts(currentStage, (res) => {
            if (res.success) {
                this.setState({
                    questTexts: res.texts,
                    stage: currentStage,
                    isEnableSave: true,
                    savedMark: ActionState.NO,
                    loadState: LoadState.LOADED
                })
            } else {
                this.setState({
                    questTexts: res.texts,
                    stage: currentStage,
                    isEnableSave: true,
                    savedMark: ActionState.NO,
                    loadState: LoadState.ERROR
                })
            }
        })
    }

    private getCurrentStage() {
        return this.props.stage;
    }


    render() {
        var currentStage = this.getCurrentStage();

        var state = this.state;
        var stageName = appStateService.getStageName(currentStage);
        var hasQuestion = state.questTexts;
        if (hasQuestion) {
            var quests = state.questTexts.quests.map(item => {
                return <QuestComponent savedValues={this.nestedValue} key={item.id} quest={item}
                                       stage={this.props.stage}/>;
            });
            var isCompletedLevel = currentStage.status == StageStatus.COMPLETED;
            var buttonStyle = "btn" + (isCompletedLevel ? " btn-success" : " btn-info");


            var savedMark = this.state.savedMark;
            var savedHtmlClass = "done-mark" + (savedMark == ActionState.ERROR || savedMark == ActionState.SAVED ? " view" : "");


            if (savedMark == ActionState.ERROR) {
                this.popupText = "Ошибка при отправке";
            } else if (savedMark == ActionState.SAVED) {
                this.popupText = "Ответы сохранены";
            }

            return (
                <div className="row">
                    <div className="col-lg-12">
                        <h1><Link to="/">
                            <span className="glyphicon glyphicon-arrow-left"></span>
                        </Link>
                            <span>{stageName} {currentStage.status == StageStatus.BONUS ?
                                (<p> Сдаете последние этап — бонус блокируется </p>) : "" }</span></h1>
                        {quests}
                    </div>
                    <div className="col-lg-12 save-level">
                        <p className="lead"></p>
                        <div className="input-group">
                            <span className="input-group-btn">
                              <button className={buttonStyle}
                                      type="button"
                                      onClick={this.saveAnswers.bind(this)}
                                      disabled={!this.state.isEnableSave || isCompletedLevel}>
                                  { this.getButtonName(currentStage, isCompletedLevel) }
                                  {savedMark == ActionState.NO ? "" :
                                      <span className={savedHtmlClass}>{this.popupText}</span>}
                              </button>
                            </span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="row">
                <div className="col-lg-12">
                    <h1><Link to="/">
                        <span className="glyphicon glyphicon-arrow-left"></span>
                    </Link>
                            <span>{stageName} {currentStage.status == StageStatus.BONUS ?
                                (<p> Сдаете последние этап — бонус блокируется </p>) : "" }</span></h1>
                    {this.state.loadState == LoadState.ERROR ?
                        <span>Ошибка загрузки данных. Попробуйте обновить страницу</span>: <LoadingComponent />}
                </div>
            </div>
        )
    }

    private getButtonName(currentStage:Stage, isCompletedLevel:boolean) {
        if (currentStage && currentStage.status == StageStatus.BONUS) {
            return "Сохранить ответы";
        }

        return isCompletedLevel ? "Этап сдан" : currentStage.last ? "Сдать уровень и завершить квест" : "Сдать уровень";
    }

    private saveAnswers() {
        var stage = this.props.stage;
        if (!stage) {
            return;
        }


        if (stage.status == StageStatus.OPEN && !window.confirm('Вы действительно хотите завершить этап?')) {
            return;
        }

        var answers:QuestAnswer[] = [];
        var nestedValue = this.nestedValue;
        for (var value in nestedValue) {
            if (nestedValue.hasOwnProperty(value)) {
                answers.push({
                    id: Number(value),
                    answer: nestedValue[value]
                })
            }
        }


        var token = auth.getToken();

        this.setState({
            questTexts: this.state.questTexts,
            stage: this.state.stage,
            isEnableSave: false,
            savedMark: ActionState.NO,
            loadState: this.state.loadState
        })

        complete({
            stageId: stage.id,
            token: token,
            answers: answers
        }, (r) => {
            if (r.success) {
                appStateService.setState(r.res);
                if (stage.status != StageStatus.BONUS) {
                    this.context["history"].push('/');
                    return;
                }

                this.setState({
                    questTexts: this.state.questTexts,
                    stage: this.state.stage,
                    isEnableSave: true,
                    savedMark: ActionState.SAVED,
                    loadState: this.state.loadState
                })

            } else {
                this.setState({
                    questTexts: this.state.questTexts,
                    stage: this.state.stage,
                    isEnableSave: true,
                    savedMark: ActionState.ERROR,
                    loadState: this.state.loadState
                })
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
        })
    }
}



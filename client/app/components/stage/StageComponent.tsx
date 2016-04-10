import * as React from "react";
import {PropTypes} from "react";
import {questService} from "../../state/QuestService";
import {LoadingComponent} from "../common/LoadingComponent";
import {QuestComponent} from "./QuestionComponent";
import {complete} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";

var Link = require('react-router/lib/Link');

export class StageComponent extends React.Component<{stage:Stage}, {questTexts?:QuestTexts, stage?:Stage}> {

    static contextTypes = {
        history: PropTypes.object.isRequired
    };

    nestedValue = {};

    constructor(props:any, context) {
        super(props, context);
        this.state = {};
    }


    componentDidMount() {
        var currentStage = this.getCurrentStage();
        questService.getAsyncQuestTexts(currentStage, (res) => {
            this.setState({
                questTexts: res,
                stage: currentStage
            })
        })
    }

    private getCurrentStage() {
        return this.props.stage;
    }


    render() {
        var currentStage = this.getCurrentStage();

        var state = this.state;
        if (state.questTexts) {
            var quests = this.state.questTexts.quests.map(item => {
                return <QuestComponent savedValues={this.nestedValue} key={item.id} quest={item}
                                       stage={this.props.stage}/>;
            });
            var isCompletedLevel = currentStage.status == StageStatus.COMPLETED;
            var buttonStyle = "btn" + (isCompletedLevel ? " btn-success" : " btn-info");
            return (
                <div className="row">
                    <div className="col-lg-12">
                        <h1><Link to="/">
                            <span className="glyphicon glyphicon-arrow-left"></span>
                        </Link>
                            <span>{appStateService.getStageName(currentStage)}</span></h1>
                        {quests}
                    </div>
                    <div className="col-lg-12 save-level">
                        <p className="lead"></p>
                        <div className="input-group">
                            <span className="input-group-btn">
                              <button className={buttonStyle}
                                      type="button"
                                      onClick={this.saveAnswers.bind(this)}
                                      disabled={isCompletedLevel}>{ this.getButtonName(currentStage, isCompletedLevel) }</button>
                            </span>
                        </div>

                    </div>
                </div>
            );
        }

        return (
            <div className="row">
                <div className="col-lg-12">
                    <h1><span>{appStateService.getStageName(currentStage)}</span></h1>
                    <LoadingComponent />
                </div>
            </div>
        )
    }

    private getButtonName(currentStage:Stage, isCompletedLevel:boolean) {
        if (currentStage && currentStage.status == StageStatus.BONUS) {
            return "Сохранить ответы";
        }

        return isCompletedLevel ? "Уровень сдан" : "Сдать уровень";
    }

    private saveAnswers() {
        if (!window.confirm('Вы действительно хотите завершить этап?')) {
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

        var stage = this.props.stage;
        var token = auth.getToken();
        complete({
            stageId: stage.id,
            token: token,
            answers: answers
        }, (r) => {
            appStateService.setState(r);
            if (stage.status != StageStatus.BONUS) {
                this.context["history"].push('/');
            }
        })
    }
}



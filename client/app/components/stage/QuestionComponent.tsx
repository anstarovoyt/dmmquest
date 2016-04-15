import * as React from "react";
import {saveAnswers} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";


export class QuestComponent extends React.Component<{quest:Quest, stage:Stage, savedValues},
    {value:string, isEnableSave:boolean, savedMark:ActionState}> {

    private timeOutMarker = null;

    popupText = "";

    constructor(props:any) {
        super(props);

        var value = this.getDefaultValue() || "";
        this.state = {
            value: value,
            savedMark: ActionState.NO,
            isEnableSave: true
        }

        this.props.savedValues[this.props.quest.id] = value;
    }


    componentWillUnmount():void {
        if (this.timeOutMarker != null) {
            clearTimeout(this.timeOutMarker);
            this.timeOutMarker = null;
        }
    }

    render() {
        var savedMark = this.state.savedMark;
        var savedHtmlClass = "done-mark" + (savedMark == ActionState.ERROR || savedMark == ActionState.SAVED ? " view" : "");

        if (savedMark == ActionState.ERROR) {
            this.popupText = "Ошибка при отправке";
        } else if (savedMark == ActionState.SAVED) {
            this.popupText = "Ответы сохранены";
        }

        var stage = this.props.stage;
        var isCompleted = stage.status == StageStatus.COMPLETED;
        var text = {__html: this.props.quest.text};
        return (
            <div className="row">
                <div className="col-xs-12 col-md-8">
                    <h4>Вопрос {this.props.quest.id + 1}</h4>
                    <div dangerouslySetInnerHTML={text}/>
                    <p className="lead"></p>
                    {this.createInputField(isCompleted, savedHtmlClass)}
                </div>
            </div>)
    }


    private createInputField(isCompleted:boolean, savedHtmlClass:string) {
        return this.createTextInputField(isCompleted, savedHtmlClass);
    }

    private createTextInputField(isCompleted:boolean, savedHtmlClass:string) {
        return <div className="input-group">
            <input type="text"
                   disabled={isCompleted}
                   className="form-control"
                   onChange={this.handlerChanged.bind(this)}
                   placeholder="Ваш ответ"
                   value={this.state.value}/>

                            <span className="input-group-btn">
                              <button
                                  disabled={!this.state.isEnableSave || isCompleted}
                                  className="btn btn-info" type="button" onClick={this.saveAnswer.bind(this)}>
                                  <span className="glyphicon glyphicon-floppy-save"></span> Сохранить<span
                                  className={savedHtmlClass}> {this.popupText} </span></button>
                            </span>
        </div>
    }

    private getDefaultValue():string {
        var props = this.props;
        var answers = props.stage.questAnswers;

        if (!answers) {
            return ""
        }


        var answer = answers[props.quest.id];
        if (!answer) {
            return ""
        }

        return answer.answer
    }

    private handlerChanged(e) {
        var newValue = e.target.value;
        var state = {
            value: newValue,
            isEnableSave: this.state.isEnableSave,
            savedMark: ActionState.NO
        };

        this.props.savedValues[this.props.quest.id] = newValue;

        this.setState(state)
    }

    private saveAnswer() {
        var quest:Quest = this.props.quest;
        var stage = this.props.stage;
        var value = this.state.value;
        this.setState({
            value: value,
            isEnableSave: false,
            savedMark: ActionState.NO
        });
        var answer:QuestAnswer = {
            id: quest.id,
            answer: value
        };
        saveAnswers({
            token: auth.getToken(),
            stageId: stage.id,
            answers: [answer]
        }, (res) => {
            if (res.success) {
                appStateService.updateStage(res.stage);
                this.setState({
                    value: value,
                    isEnableSave: true,
                    savedMark: ActionState.SAVED
                });
            } else {
                this.setState({
                    value: value,
                    isEnableSave: true,
                    savedMark: ActionState.ERROR
                });
            }

            this.timeOutMarker = setTimeout(() => {
                this.setState({
                    value: this.state.value,
                    isEnableSave: this.state.isEnableSave,
                    savedMark: ActionState.NO
                });

                this.timeOutMarker = null;
            }, 1000);
        })
    }
}
import * as React from "react";
import {saveAnswers, uploadFileToAWS, getAWSSign} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";


export class QuestComponent extends React.Component<{quest:Quest, stage:Stage, savedValues},
    {value:string, noBackgroundActions:boolean, savedMark:ActionState}> {

    private timeOutMarker = null;

    popupText = "";

    constructor(props:any) {
        super(props);

        var value = this.getDefaultValue() || "";
        this.state = {
            value: value,
            savedMark: ActionState.NO,
            noBackgroundActions: true
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
            var type = this.props.quest.type;
            this.popupText = (!type || type == QuestType.TEXT) ? "Ответы сохранены" : "Файл загружен";
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
        var type = this.props.quest.type;
        if (type == QuestType.UPLOAD || type == QuestType.UPLOAD_5) {
            return this.createUploadField(isCompleted, savedHtmlClass);
        }
        return this.createTextInputField(isCompleted, savedHtmlClass);
    }


    private createUploadField(isCompleted:boolean, savedHtmlClass:string) {
        var hasBackground = !this.state.noBackgroundActions;

        var iconSpan = hasBackground ? this.getAnimatedIconSpan() : this.getUploadIconSpan();

        return <div className="input-group">
            <input type="text"
                   disabled={true}
                   value={this.state.value}
                   className="form-control"
                   placeholder="Загрузите файл"/>
                            <span className="input-group-btn">
                                <label disabled={isCompleted} className="btn btn-info">
                              <input
                                  type="file"
                                  disabled={isCompleted}
                                  onChange={this.uploadFile.bind(this)}>
                                  {iconSpan}&nbsp;Загрузить{this.getPopupSpan(savedHtmlClass)}</input>
                                </label>
                            </span>
        </div>
    }


    private createTextInputField(isCompleted:boolean, savedHtmlClass:string) {
        var isSendDisabled = !this.state.noBackgroundActions || isCompleted;
        return <div className="input-group">
            <input type="text"
                   disabled={isCompleted}
                   className="form-control"
                   onChange={this.handlerChanged.bind(this)}
                   placeholder="Ваш ответ"
                   value={this.state.value}/>
                            <span className="input-group-btn">
                              <button
                                  disabled={isSendDisabled}
                                  className="btn btn-info" type="button" onClick={this.saveAnswer.bind(this)}>
                                  {this.getSaveIconSpan()}&nbsp;Сохранить {this.getPopupSpan(savedHtmlClass)}</button>
                            </span>
        </div>
    }

    private getSaveIconSpan() {
        //noinspection CheckTagEmptyBody
        return <span
            className="glyphicon glyphicon-floppy-save"></span>;
    }


    private getUploadIconSpan() {
        //noinspection CheckTagEmptyBody
        return <span
            className="glyphicon glyphicon-floppy-open"></span>;
    }

    private getAnimatedIconSpan() {
        //noinspection CheckTagEmptyBody
        // return <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>
        return <span className="glyphicon glyphicon-refresh"></span>;
    }

    private getPopupSpan(savedHtmlClass) {
        return <span className={savedHtmlClass}> {this.popupText} </span>;
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
            noBackgroundActions: this.state.noBackgroundActions,
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
            noBackgroundActions: false,
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
                    noBackgroundActions: true,
                    savedMark: ActionState.SAVED
                });
            } else {
                this.setState({
                    value: value,
                    noBackgroundActions: true,
                    savedMark: ActionState.ERROR
                });
            }
            this.setTimeoutToResetMarks();
        })
    }


    private setTimeoutToResetMarks() {
        if (this.timeOutMarker) {
            clearTimeout(this.timeOutMarker);
        }
        this.timeOutMarker = setTimeout(() => {
            this.setState({
                value: this.state.value,
                noBackgroundActions: this.state.noBackgroundActions,
                savedMark: ActionState.NO
            });

            this.timeOutMarker = null;
        }, 1000);
    }

    uploadFile(e) {
        e.preventDefault();
        var target = e.target;
        var files = target.files;
        var file = files[0];
        var stateValue = this.state.value;
        if (file == null) {
            return;
        }

        this.setState({
            value: stateValue,
            noBackgroundActions: false,
            savedMark: ActionState.NO
        });

        getAWSSign({
            token: auth.getToken(),
            fileName: file.name,
            fileType: file.type,
            stageId: this.props.stage.id,
            questId: this.props.quest.id
        }, (res) => {
            if (!res.success) {
                this.setState({
                    value: stateValue,
                    noBackgroundActions: true,
                    savedMark: ActionState.ERROR
                });
                this.setTimeoutToResetMarks();
                return;
            }


            uploadFileToAWS({
                file: file,
                sign: res.sign,
                url: res.url
            }, (res) => {
                if (res.success) {
                    var newValue = getUpdatedValue(this.state.value);
                    var quest:Quest = this.props.quest;
                    var stage = this.props.stage;
                    var answer:QuestAnswer = {
                        id: quest.id,
                        answer: newValue
                    };
                    saveAnswers({
                        token: auth.getToken(),
                        stageId: stage.id,
                        answers: [answer]
                    }, (res) => {
                        if (res.success) {
                            appStateService.updateStage(res.stage);
                            
                            this.setState({
                                value: newValue,
                                noBackgroundActions: true,
                                savedMark: ActionState.SAVED
                            });

                            
                        } else {
                            this.setState({
                                value: stateValue,
                                noBackgroundActions: true,
                                savedMark: ActionState.ERROR
                            });
                        }
                        this.setTimeoutToResetMarks();
                    });
                } else {
                    this.setState({
                        value: stateValue,
                        noBackgroundActions: true,
                        savedMark: ActionState.ERROR
                    });
                    this.setTimeoutToResetMarks();
                }
            })
        })
    }
}

function getUpdatedValue(value) {
    if (!value) {
        return "Файлов: 1";
    }

    var index = value.indexOf(' ');
    if (index > 0) {
        var numberString = value.substr(index);
        var newNumber = 1 + Number(numberString);
        return "Файлов: " + newNumber;
    }
    return "Файлов: 1";
}
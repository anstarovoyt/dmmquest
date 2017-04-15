import * as React from "react";
import {saveAnswers, uploadFileToAWS, getAWSSign} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";


export class QuestComponent extends React.Component<{ quest: Quest, stage: Stage, savedValues },
    { value: string, noBackgroundActions: boolean, savedMark: ActionState }> {

    private timeOutMarker = null;

    popupText = "";

    constructor(props: any) {
        super(props);

        const value = this.getDefaultValue() || "";
        this.state = {
            value: value,
            savedMark: ActionState.NO,
            noBackgroundActions: true
        }

        this.props.savedValues[this.props.quest.id] = value;
    }


    componentWillUnmount(): void {
        if (this.timeOutMarker != null) {
            clearTimeout(this.timeOutMarker);
            this.timeOutMarker = null;
        }
    }

    render() {
        const savedMark = this.state.savedMark;
        const savedHtmlClass = "done-mark" + (savedMark == ActionState.ERROR || savedMark == ActionState.SAVED ? " view" : "");

        if (savedMark == ActionState.ERROR) {
            this.popupText = "Ошибка при отправке";
        } else if (savedMark == ActionState.SAVED) {
            let type = this.props.quest.type;
            this.popupText = (!type || type == QuestType.TEXT || type == QuestType.LIST_BOX) ? "Ответы сохранены" : "Файл загружен";
        }

        const stage = this.props.stage;
        const isCompleted = stage.status == StageStatus.COMPLETED || stage.status == StageStatus.KILLER_COMPLETED;

        const text = {__html: this.props.quest.text};
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


    private createInputField(isCompleted: boolean, savedHtmlClass: string) {
        const type = this.props.quest.type;
        if (type == QuestType.UPLOAD || type == QuestType.UPLOAD_5) {
            return this.createUploadField(isCompleted, savedHtmlClass);
        }

        if (type == QuestType.LIST_BOX) {
            return this.createListBoxField(isCompleted, savedHtmlClass);
        }

        return this.createTextInputField(isCompleted, savedHtmlClass);
    }

    private createListBoxField(isCompleted: boolean, savedHtmlClass: string) {
        const isSendDisabled = !this.state.noBackgroundActions || isCompleted;

        let items = this.props.quest.values.map(el => {
            return <option key={el} value={el}>{el}</option>;
        });

        return <div className="input-group">
            <select className="form-control my-select-no-border" onChange={this.handlerChanged.bind(this)}
                    disabled={isCompleted}
                    value={this.state.value}>
                {items}
            </select>
            <span className="input-group-btn my-padding-left">
                              <button
                                  disabled={isSendDisabled}
                                  className="btn btn-info" type="button" onClick={this.saveAnswer.bind(this)}>
                                  {this.getSaveIconSpan()}&nbsp;Сохранить {this.getPopupSpan(savedHtmlClass)}</button>
                            </span>
        </div>
    }


    private createUploadField(isCompleted: boolean, savedHtmlClass: string) {
        const hasBackground = !this.state.noBackgroundActions;

        const iconSpan = hasBackground ? this.getAnimatedIconSpan() : this.getUploadIconSpan();
        const downloadMessage = hasBackground ? "Загрузка..." : "Загрузить";
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
                                  {iconSpan}&nbsp;{downloadMessage}{this.getPopupSpan(savedHtmlClass)}</input>
                                </label>
                            </span>
        </div>
    }


    private createTextInputField(isCompleted: boolean, savedHtmlClass: string) {
        const isSendDisabled = !this.state.noBackgroundActions || isCompleted;
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

    private getDefaultValue(): string {
        const props = this.props;
        let answers = props.stage.questAnswers;

        if (!answers) {
            return ""
        }


        let answer = answers[props.quest.id];
        if (!answer) {
            return ""
        }

        return answer.answer
    }

    private handlerChanged(e) {
        const newValue = e.target.value;
        const state = {
            value: newValue,
            noBackgroundActions: this.state.noBackgroundActions,
            savedMark: ActionState.NO
        };

        this.props.savedValues[this.props.quest.id] = newValue;

        this.setState(state)
    }

    private saveAnswer() {
        const quest: Quest = this.props.quest;
        const stage = this.props.stage;
        const value = this.state.value;
        this.setState({
            value: value,
            noBackgroundActions: false,
            savedMark: ActionState.NO
        });
        const answer: QuestAnswer = {
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
        }, 3000);
    }

    uploadFile(e) {
        e.preventDefault();
        const target = e.target;
        const files = target.files;
        const file = files[0];
        const stateValue = this.state.value;
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
                target.value = "";
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
                    const newValue = getUpdatedValue(this.state.value);
                    const quest: Quest = this.props.quest;
                    const stage = this.props.stage;
                    const answer: QuestAnswer = {
                        id: quest.id,
                        answer: newValue
                    };
                    saveAnswers({
                        token: auth.getToken(),
                        stageId: stage.id,
                        answers: [answer]
                    }, (res) => {
                        target.value = "";
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
                    target.value = "";
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

    const index = value.indexOf(' ');
    if (index > 0) {
        const numberString = value.substr(index);
        const newNumber = 1 + Number(numberString);
        return "Файлов: " + newNumber;
    }
    return "Файлов: 1";
}
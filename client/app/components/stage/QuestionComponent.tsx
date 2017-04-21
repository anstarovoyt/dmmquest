import * as React from 'react';
import {saveAnswers} from '../../communitation/Dispatcher';
import {auth} from '../../authentication/AuthService';
import {appStateService} from '../../state/AppStateService';
import {FileUploadControl} from './controls/FileUploadControl';


export type AnswerWithBonus = { answer: string, teamBonus?: string };
export type NestedValue = { [id: number]: AnswerWithBonus };

export class QuestComponent extends React.Component<{ quest: Quest, stage: Stage, savedValues: NestedValue },
    { value: string, savedMark: ActionState }> {

    private timeOutMarker = null;

    popupText = '';

    constructor(props: any) {
        super(props);

        const value = this.getDefaultValue() || '';

        this.state = {
            value: value,
            savedMark: ActionState.NO
        };

        let toSave: AnswerWithBonus = {
            answer: value
        };
        const bonus = this.getDefaultValue(true) || '';
        if (bonus) {
            toSave.teamBonus = bonus;
        }

        this.props.savedValues[this.props.quest.id] = toSave;
    }


    componentWillUnmount(): void {
        if (this.timeOutMarker != null) {
            clearTimeout(this.timeOutMarker);
            this.timeOutMarker = null;
        }
    }

    render() {
        const savedMark = this.state.savedMark;
        const savedHtmlClass = 'done-mark' + (savedMark == ActionState.ERROR || savedMark == ActionState.SAVED ? ' view' : '');

        if (savedMark == ActionState.ERROR) {
            this.popupText = 'Ошибка при отправке';
        } else if (savedMark == ActionState.SAVED) {
            let type = this.props.quest.type;
            this.popupText = (!type || type == QuestType.TEXT || type == QuestType.LIST_BOX) ? 'Ответы сохранены' : 'Файл загружен';
        }

        const stage = this.props.stage;
        const isCompleted = stage.status == StageStatus.COMPLETED || stage.status == StageStatus.KILLER_COMPLETED;

        const text = {__html: this.props.quest.text};
        const stageInfo = this.props.quest.stageName == null ? '' : <i> Этап {this.props.quest.stageName} </i>;


        return (
            <div className="row">
                <div className="col-xs-12 col-md-8">
                    <h4>Вопрос {this.props.quest.id + 1}</h4>
                    {stageInfo}
                    <div dangerouslySetInnerHTML={text}/>
                    <p className="lead"></p>
                    {this.createInputField(isCompleted, savedHtmlClass)}
                    <br/>
                    {(stage.status == StageStatus.OPEN || stage.status == StageStatus.COMPLETED) ?
                        <b>Бонус за командность:</b> : ''}
                    {(stage.status == StageStatus.OPEN || stage.status == StageStatus.COMPLETED) ? this.createTeamBonus() : ''}
                </div>
            </div>);
    }

    private createTeamBonus() {
        return <FileUploadControl saveValue={this.uploadTeamBonus.bind(this)}
                                  stageId={this.props.stage.id}
                                  questId={this.props.quest.id}
                                  typeText="Team"
                                  value={this.getDefaultValue(true) || ''}/>;
    }


    private createInputField(isCompleted: boolean, savedHtmlClass: string) {
        const type = this.props.quest.type;
        if (type == QuestType.UPLOAD || type == QuestType.UPLOAD_5) {
            return this.createUploadField();
        }

        if (type == QuestType.LIST_BOX) {
            return this.createListBoxField(isCompleted, savedHtmlClass);
        }

        return this.createTextInputField(isCompleted, savedHtmlClass);
    }

    private createListBoxField(isCompleted: boolean, savedHtmlClass: string) {
        const isSendDisabled = isCompleted;

        let items = this.props.quest.values.map(el => {
            return <option key={el} value={el}>{el}</option>;
        });

        let currentValue = this.state.value;
        if (!currentValue) {
            //will be selected first value
            this.props.savedValues[this.props.quest.id].answer = this.props.quest.values[0];
        }

        return <div className="input-group">
            <select className="form-control my-select-no-border" onChange={this.handlerChanged.bind(this)}
                    disabled={isCompleted}
                    value={currentValue}>
                {items}
            </select>
            <span className="input-group-btn my-padding-left">
                              <button
                                  disabled={isSendDisabled}
                                  className="btn btn-info" type="button" onClick={this.saveAnswer.bind(this)}>
                                  {this.getSaveIconSpan()}&nbsp;Сохранить {this.getPopupSpan(savedHtmlClass)}</button>
                            </span>
        </div>;
    }


    private createUploadField() {

        return <FileUploadControl saveValue={this.uploadAnswer.bind(this)}
                                  stageId={this.props.stage.id}
                                  typeText="Answer"
                                  questId={this.props.quest.id}
                                  value={this.getDefaultValue() || ''}/>;
    }

    private createTextInputField(isCompleted: boolean, savedHtmlClass: string) {
        return <div className="input-group">
            <input type="text"
                   disabled={isCompleted}
                   className="form-control"
                   onChange={this.handlerChanged.bind(this)}
                   placeholder="Ваш ответ"
                   value={this.state.value}/>
            <span className="input-group-btn">
                              <button
                                  disabled={isCompleted}
                                  className="btn btn-info" type="button" onClick={this.saveAnswer.bind(this)}>
                                  {this.getSaveIconSpan()}&nbsp;Сохранить {this.getPopupSpan(savedHtmlClass)}</button>
                            </span>
        </div>;
    }

    private getSaveIconSpan() {
        //noinspection CheckTagEmptyBody
        return <span className="glyphicon glyphicon-floppy-save"></span>;
    }


    private getPopupSpan(savedHtmlClass) {
        return <span className={savedHtmlClass}> {this.popupText} </span>;
    }

    private getDefaultValue(team: boolean = false): string {
        const props = this.props;
        let answers = team ? props.stage.teamBonuses : props.stage.questAnswers;

        if (!answers) {
            return '';
        }


        let answer = answers[props.quest.id];
        if (!answer) {
            return '';
        }

        return answer.answer;
    }

    private handlerChanged(e) {
        const newValue: string = e.target.value;
        const state = {
            value: newValue,
            savedMark: ActionState.NO
        };

        let oldValue = this.props.savedValues[this.props.quest.id];

        this.props.savedValues[this.props.quest.id] = {
            answer: newValue,
        };
        if (oldValue.teamBonus) {
            this.props.savedValues[this.props.quest.id].teamBonus = oldValue.teamBonus;
        }

        this.setState(state);
    }

    private saveAnswer() {
        const quest: Quest = this.props.quest;
        const stage = this.props.stage;
        const value = this.state.value;
        this.setState({
            value: value,
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
                    savedMark: ActionState.SAVED
                });
            } else {
                this.setState({
                    value: value,
                    savedMark: ActionState.ERROR
                });
            }
            this.setTimeoutToResetMarks();
        });
    }


    private setTimeoutToResetMarks() {
        if (this.timeOutMarker) {
            clearTimeout(this.timeOutMarker);
        }
        this.timeOutMarker = setTimeout(() => {
            this.setState({
                value: this.state.value,
                savedMark: ActionState.NO
            });

            this.timeOutMarker = null;
        }, 3000);
    }

    uploadAnswer(newValue: string, updateState: (success: boolean) => void) {
        this.fileUploadResultImpl(false, newValue, updateState);
    }

    uploadTeamBonus(newValue: string, updateState: (success: boolean) => void) {
        this.fileUploadResultImpl(true, newValue, updateState);
    }


    fileUploadResultImpl(teamBonus: boolean, newValue: string, updateState: (success: boolean) => void) {
        const quest: Quest = this.props.quest;
        const stage = this.props.stage;
        const answer: QuestAnswer = {
            id: quest.id,
            answer: newValue
        };
        let toSend: AnswersUpdateRequest = {
            token: auth.getToken(),
            stageId: stage.id
        };

        if (teamBonus) {
            toSend.teamBonuses = [answer];
        } else {
            toSend.answers = [answer];
        }

        saveAnswers(toSend, (res) => {
            updateState(res.success);
            if (res.success) {
                appStateService.updateStage(res.stage);
            }
        });
    }
}
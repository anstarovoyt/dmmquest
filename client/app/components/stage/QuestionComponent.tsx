import * as React from "react"
import {saveAnswers} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";

export class QuestComponent extends React.Component<{quest:Quest, stage:Stage}, {value:string, isEnableSave:boolean}> {


    constructor(props:{quest:Quest; stage:Stage}) {
        super(props);
        this.state = {
            value: this.getDefaultValue() || "",
            isEnableSave: true
        }
    }


    render() {

        return (
            <div className="row">
                <div className="col-xs-12 col-md-8">
                    <h4>Вопрос {this.props.quest.id + 1}</h4>
                    <p>{this.props.quest.text}</p>
                    <p className="lead"></p>
                    <div className="input-group">
                        <input type="text"
                               className="form-control"
                               onChange={this.handlerChanged.bind(this)}
                               placeholder="Ваш ответ"
                               value={this.state.value}/>
                            
                            <span className="input-group-btn">
                              <button
                                  disabled={!this.state.isEnableSave}

                                  className="btn btn-info" type="button" onClick={this.saveAnswer.bind(this)}>
                                  <span className="glyphicon glyphicon-floppy-save"></span> Сохранить</button>
                            </span>
                    </div>
                </div>
            </div>)
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
        this.setState({
            value: e.target.value,
            isEnableSave: this.state.isEnableSave
        })
    }

    private saveAnswer() {

        var quest:Quest = this.props.quest;
        var stage = this.props.stage;
        var value = this.state.value;
        this.setState({
            value: value,
            isEnableSave: false
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
            appStateService.updateAnswer(stage, answer);
            this.setState({
                value: value,
                isEnableSave: true
            });


        })
    }
}
import * as React from "react"
import {questService} from "../../state/QuestService";
import {LoadingComponent} from "../common/LoadingComponent";

export class StageComponent extends React.Component<{stage:Stage}, {questTexts?:QuestTexts, stage?:Stage}> {


    constructor(props:any) {
        super(props);
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

        if (this.state.questTexts) {
            var todoItems = this.state.questTexts.quests.map(item => {
                return <QuestComponent key={item.id} quest={item} stage={this.props.stage}/>;
            });
            return (
                <div className="col-lg-12">
                    <h1><span>Этап 1</span></h1>
                    <ul>{todoItems}</ul>
                </div>
            );
        }

        return (
            <div className="col-lg-12">
                <h1><span>{currentStage.name}</span></h1>
                <LoadingComponent />
            </div>
        )
    }
}

class QuestComponent extends React.Component<{quest:Quest, stage:Stage}, any> {

    render() {

        return (
            <div className="row">
                <div className="col-xs-12 col-md-8">
                    <h4>Вопрос {this.props.quest.id + 1}</h4>
                    <p>{this.props.quest.text}</p>
                    <p className="lead">
                        <div className="input-group">
                            <input type="text"
                                   className="form-control"
                                   placeholder="Ваш ответ"
                                   defaultValue={this.getDefaultValue()}/>
                            
                            <span className="input-group-btn">
                              <button className="btn btn-info" type="button">
                                  <span className="glyphicon glyphicon-floppy-save"/> Сохранить</button>
                            </span>
                        </div>
                    </p>
                </div>
            </div>)
    }

    private getDefaultValue() {
        var props = this.props;
        var answers = props.stage.questAnswers;

        return answers ? answers[props.quest.id] : "";
    }
}
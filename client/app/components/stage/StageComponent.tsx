import * as React from "react"
import {questService} from "../../state/QuestService";
import {LoadingComponent} from "../common/LoadingComponent";
import {Link} from 'react-router'
import {QuestComponent} from "./QuestionComponent";

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

        var state = this.state;
        if (state.questTexts) {
            var quests = this.state.questTexts.quests.map(item => {
                return <QuestComponent key={item.id} quest={item} stage={this.props.stage}/>;
            });
            return (
                <div className="row">
                    <div className="col-lg-12">
                        <h1><Link to="/">
                            <span className="glyphicon glyphicon-arrow-left"></span>
                        </Link>
                            <span>{currentStage.name}</span></h1>
                        {quests}
                    </div>
                    <div className="col-lg-12 save-level">
                        <p className="lead"></p>
                        <div className="input-group">
                            <span className="input-group-btn">
                              <button className="btn btn-info" type="button"
                                      disabled={currentStage.isCompleted}>{currentStage.isCompleted ? "Уровень сдан" : "Сдать уровень" }</button>
                            </span>
                        </div>

                    </div>
                </div>
            );
        }

        return (
            <div className="row">
                <div className="col-lg-12">
                    <h1><span>{currentStage.name}</span></h1>
                    <LoadingComponent />
                </div>
            </div>
        )
    }
}


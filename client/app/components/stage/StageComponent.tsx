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

        if (this.state.questTexts) {
            var todoItems = this.state.questTexts.quests.map(item => {
                return <QuestComponent key={item.id} quest={item} stage={this.props.stage}/>;
            });
            return (
                <div className="col-lg-12">
                    <h1><Link to="/">
                        <span className="glyphicon glyphicon-arrow-left"></span>
                    </Link>
                        <span>Этап 1</span></h1>
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


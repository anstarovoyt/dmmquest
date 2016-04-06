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
                <div>
                    <ul>{todoItems}</ul>
                </div>
            );
        }

        return <LoadingComponent />;
    }
}

class QuestComponent extends React.Component<{quest:Quest, stage:Stage}, any> {

    render() {
        return <div> {this.props.quest.text} </div>
    }
}
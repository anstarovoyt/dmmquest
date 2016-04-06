import * as React from "react"
import {questService} from "../../state/QuestService";

export class StageComponent extends React.Component<any, {questTexts?: QuestTexts, stage?: Stage}> {


	constructor(props: any) {
		super(props)
		this.state = {};
	}

	componentDidMount() {
		var stage: Stage = {
			id: "1"
		};

		questService.getAsyncQuestTexts(stage, (res) => {
			console.log('changed state')
			this.setState({
				questTexts: res,
				stage: stage
			})
		})
	}


	render() {
		if (this.state.questTexts) {
			var todoItems = this.state.questTexts.quests.map(item => {
				return <QuestComponent key={item.id} quest={item} stage={this.state.stage}/>;
			});
			return (
				<div>
					<ul>{todoItems}</ul>
				</div>
			);
		} else {
			return (
				<div>
					<ul>Нет открытых квестов!</ul>
				</div>
			);
		}
	}
}

class QuestComponent extends React.Component<{quest: Quest, stage: Stage}, any> {

	render() {
		return <div> {this.props.quest.text} </div>
	}
}
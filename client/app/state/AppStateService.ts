import {appStateStore} from "./AppStateStore";
import {loadState} from "../communitation/Dispatcher";
import {auth} from "../authentication/AuthService";

class AppStateService {

    private state:AppState;

    updateState() {
        if (this.state) {
            //do nothing
        } else {
            this.loadState();
        }
    }

    getState():AppState {
        return this.state;
    }

    setState(newState:AppState) {
        this.state = newState;
        this.onChange();
    }

    updateAnswer(stage:Stage, answer:QuestAnswer) {
        var newState = cloneAppState(this.state);

        var newUnChangedStage:Stage = newState.stages[stage.id];
        var questAnswers = newUnChangedStage.questAnswers;
        if (!questAnswers) {
            questAnswers = {};
            newUnChangedStage.questAnswers = questAnswers;
        }
        questAnswers[answer.id] = answer;
        this.setState(newState);
    }

    onChange() {
        appStateStore.emitChange(this.state);
    }

    private loadState() {
        loadState({token: auth.getToken()}, response => {
            this.state = response.state;
            console.log('State')
            this.onChange();
        });
    }
}

function cloneAppState(oldState:AppState):AppState {
    var result:any = {};

    var oldStages = oldState.stages;
    var newStages:Stage[] = [];
    for (let cur of oldStages) {
        var oldStage:Stage = cur;
        var newStage:any = {};
        newStage.status = oldStage.status;
        newStage.name = oldStage.name;
        newStage.id = oldStage.id;
        var oldAnswers = oldStage.questAnswers;
        if (oldAnswers) {
            var newAnswers:any = {};

            for (var oldAnswerKey in oldAnswers) {
                if (oldAnswers.hasOwnProperty(oldAnswerKey)) {
                    var oldAnswer:QuestAnswer = oldAnswers[oldAnswerKey];
                    newAnswers[oldAnswerKey] = {
                        id: oldAnswer.id,
                        answer: oldAnswer.answer
                    }
                }
            }
            newStage.questAnswers = newAnswers;
        }

        newStages.push(newStage);
    }
    result.stages = newStages;

    return result;

}
var appStateService = new AppStateService();

export {appStateService}

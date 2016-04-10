import {appStateStore} from "./AppStateStore";
import {loadState} from "../communitation/Dispatcher";
import {auth} from "../authentication/AuthService";

class AppStateService {

    private fullState:FullAppState;

    updateState() {
        if (this.fullState) {
            //do nothing
        } else {
            this.loadFullState();
        }
    }

    getAppState():AppState {
        return this.fullState && this.fullState.appState;
    }

    setState(newState:AppState) {
        this.fullState.appState = newState;
        this.onChange();
    }

    getStageName(stage:Stage) {
        var app = this.fullState;
        if (!app) {
            return ""
        }

        return app.stagesNames[stage.id];
    }

    updateStage(newStage:Stage) {
        var newState = cloneAppState(this.fullState.appState);

        var id = newStage.id;
        if (id == "bonus") {
            newState.bonus = newStage;
            return
        }

        var stages = newState.stages;
        for (var i = 0; i < stages.length; i++) {
            var stg = stages[i];
            if (stg.id == id) {
                stages[i] = newStage;
                break;
            }
        }

        this.setState(newState);
    }

    onChange() {
        var fullState = this.fullState;
        appStateStore.emitChange(fullState == null ? null : fullState.appState);
    }

    private loadFullState() {
        var token = auth.getToken();
        console.log('load full state: ' + token);
        loadState({token: token}, response => {
            this.fullState = response.state;
            console.log('State');
            this.onChange();
        });
    }

    clean() {
        this.fullState = null;
        this.onChange();
    }
}

function cloneAppState(oldState:AppState):AppState {
    var result:AppState = {
        bonus: oldState.bonus,
        stages: null
    };

    var oldStages = oldState.stages;
    var newStages:Stage[] = [];
    for (let cur of oldStages) {
        newStages.push(cur);
    }
    result.stages = newStages;

    return result;

}

export function getStageById(state:AppState, stageId:string) {
    if (!state) {
        return null;
    }
    for (var stage of state.stages) {
        if (stage.id == stageId) {
            return stage;
        }
    }
    
    if (stageId == 'bonus') {
        return state.bonus;
    }

    return null;
}


var appStateService = new AppStateService();

export {appStateService}

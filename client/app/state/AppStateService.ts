import {appStateStore} from "./AppStateStore";
import {loadState} from "../communitation/Dispatcher";
import {auth} from "../authentication/AuthService";

class AppStateService {

    private fullState: FullAppState;

    updateState() {
        if (this.fullState) {
            //do nothing
        } else {
            this.loadFullState();
        }
    }

    getAppState(): AppState {
        return this.fullState && this.fullState.appState;
    }

    setState(newState: AppState) {
        this.fullState.appState = newState;
        this.onChange();
    }

    getIntro() {
        const app = this.fullState;
        if (!app) {
            return ""
        }

        return app.intro;
    }

    getStageNameById(stageId: string) {
        let app = this.fullState;
        if (!app) {
            return ""
        }

        return app.stagesNames[stageId];
    }

    getStageName(stage: Stage) {
        if (!stage) {
            return "";
        }

        return this.getStageNameById(stage.id);
    }

    updateStage(newStage: Stage) {
        const newState = cloneAppState(this.fullState.appState);

        const id = newStage.id;
        if (id == "bonus") {
            newState.bonus = newStage;
            return
        }

        const stages = newState.stages;
        for (let i = 0; i < stages.length; i++) {
            const stg = stages[i];
            if (stg.id == id) {
                stages[i] = newStage;
                break;
            }
        }

        this.setState(newState);
    }

    onChange() {
        const fullState = this.fullState;
        appStateStore.emitChange(fullState == null ? null : fullState.appState);
    }

    private loadFullState() {
        const token = auth.getToken();
        loadState({token: token}, response => {
            this.fullState = response.state;
            this.onChange();
        });
    }

    clean() {
        this.fullState = null;
        this.onChange();
    }
}

function cloneAppState(oldState: AppState): AppState {
    const result: AppState = {
        bonus: oldState.bonus,
        stages: null
    };

    const oldStages = oldState.stages;
    const newStages: Stage[] = [];
    for (let cur of oldStages) {
        newStages.push(cur);
    }
    result.stages = newStages;

    return result;

}

export function getStageById(state: AppState, stageId: string) {
    if (!state) {
        return null;
    }
    for (let stage of state.stages) {
        if (stage.id == stageId) {
            return stage;
        }
    }

    if (stageId == 'bonus') {
        return state.bonus;
    }

    return null;
}


const appStateService = new AppStateService();

export {appStateService}

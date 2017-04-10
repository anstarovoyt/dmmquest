import {Store} from "./Store";
import {defaultData} from "./data";
import {createDefaultAppState} from "./utils";


export class StateManager {
    constructor(public dbStore: Store) {
        this.states = dbStore.getDefaultStates();
    }

    states: {
        [token: string]: AppState;
    };

    getState(token: string) {
        return this.states[token];
    }

    initDefaultStateObject(team: Team): AppState {
        let defaultAppState = createDefaultAppState(team);

        this.states[team.tokenId] = defaultAppState;
        return defaultAppState;
    }

    saveAppDB(token: string, state: AppState, callback?: (res) => void) {
        this.dbStore.saveAppDB(token, state, callback);
    }

}
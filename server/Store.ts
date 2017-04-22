import {initRedisStore} from "./RedisClient";
import {createDefaultAppState, getDefaultTeams, logServer} from "./utils";

export interface Store {
    saveAppDB(token: string, state: AppState, callback?: (res) => void): void;

    saveTeamDB(team: Team, callback: () => void): void;

    removeTeamDB(team: Team): void;

    getTeams(): Team[];

    getDefaultStates(): { [p: string]: AppState };
}

export function initStore(callback: () => void): Store {

    setImmediate(() => {
        logServer("Run local service");
        callback();
    });

    const defaultTeams: Team[] = getDefaultTeams();

    return {
        saveTeamDB(team: Team, callback?: () => void) {
            defaultTeams.push(team);
            if (callback) {
                callback();
            }
        },
        saveAppDB(token: string, state: AppState, callback?: (res) => void) {
        },
        removeTeamDB(team: Team) {

        },
        getTeams() {
            return defaultTeams;
        },
        getDefaultStates() {
            let result = {};
            for (let obj of this.getTeams()) {
                result[obj.tokenId] = createDefaultAppState(obj);
            }

            return result;
        }
    }
}
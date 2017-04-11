import {initRedisStore} from "./RedisClient";
import {createDefaultAppState, getDefaultTeams} from "./utils";
export interface Store {
    saveAppDB(token: string, state: AppState, callback?: (res) => void): void;

    saveTeamDB(team: Team, callback: () => void): void;
    removeTeamDB(team: Team): void;
    getTeams(): Team[];
    getDefaultStates(): { [p: string]: AppState };
}

export function initStore(callback: () => void): Store {
    if (process.env.REDIS_URL) {
        return initRedisStore(callback);
    }

    setImmediate(() => callback());

    return {
        saveTeamDB(team: Team, callback: () => void) {
        },
        saveAppDB(token: string, state: AppState, callback?: (res) => void) {
        },
        removeTeamDB(team: Team) {
        },
        getTeams() {
            return getDefaultTeams();
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
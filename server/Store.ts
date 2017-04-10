import {initRedisStore} from "./RedisClient";
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
            return [];
        },
        getDefaultStates() {
            return {};
        }
    }
}
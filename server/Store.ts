export interface Store {
    saveTeamDB(team: Team, callback: () => void): void;
    saveAppDB(token: string, state: AppState, callback?: (res) => void): void;
    removeTeamDB(team: Team): void;
}

export function initStore(callback: () => void): Store {
    if (process.env.REDIS_URL) {

    }

    return {
        saveTeamDB(team: Team, callback: () => void) {
        },
        saveAppDB(token: string, state: AppState, callback?: (res) => void) {
        },
        removeTeamDB(team: Team) {
        }
    }
}
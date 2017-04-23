import {defaultData} from './data';
import {logServer, toEkbString} from './utils';
import {Store} from './Store';
import {StateManager} from './StateManager';

export const COUNT_HOURS_TO_SOLVE = 8;

export class TeamManager {


    constructor(private stageModifier: StateManager, private dbStore: Store) {
    }

    findTeamByCode(secretCode: string): Team {
        if (!secretCode) {
            return null;
        }
        for (let team of this.dbStore.getTeams()) {
            if (team.secretCode.toLocaleLowerCase() == secretCode.toLocaleLowerCase()) {
                return team;
            }
        }
        return null;
    }

    findTeamByToken(tokenId: string): Team {
        for (let team of this.dbStore.getTeams()) {
            if (team.tokenId == tokenId) {
                return team;
            }
        }

        return null;
    }

    removeTeam(tokenId): boolean {
        let team = this.findTeamByToken(tokenId);
        if (!team) {
            return false;
        }

        delete this.stageModifier.states[tokenId];
        logServer('ALERT: Removed team from app ' + team.name + ' token: ' + team.tokenId);

        this.dbStore.removeTeamDB(team);

        return true;

    }

    createTeam(name: string): Team {
        const secretCode = TeamManager.makeid();
        const newStartFrom = this.getNextStartFromStage();
        const team: Team = {
            name,
            secretCode,
            tokenId: secretCode,
            startFromStage: newStartFrom
        };

        const token = team.tokenId;
        logServer('Added team to app: ' + team.name + ' ' + team.secretCode);
        this.saveTeamToDB(team, () => {
            logServer('Saved team to database: ' + team.name);
        });
        this.dbStore.saveAppDB(token, (this.getAppState(token)), () => {
            logServer('Saved state to database: ' + team.name);
        });

        return team;
    }

    getAppState(token): AppState {
        let state = this.stageModifier.getState(token);
        if (state) {
            return state;
        }

        return this.createAppState(token);
    }

    createAppState(token: string): AppState {
        logServer('Init state:' + token);
        let team = this.findTeamByToken(token);
        if (!team) {
            return null;
        }

        return this.stageModifier.initDefaultStateObject(team);
    }


    listTeams(): Team[] {
        return this.dbStore.getTeams();
    }

    login(secretCode: string): LoginInfo {
        const team = this.findTeamByCode(secretCode);

        let first = false;

        if (team) {
            if (!team.firstLoginDate && !team.admin) {
                const date = new Date();

                const endDate = new Date(); //new object!
                endDate.setTime(date.getTime() + (COUNT_HOURS_TO_SOLVE * 60 * 60 * 1000));
                team.endQuestDate = endDate;
                team.firstLoginDate = date;
                first = true;
                logServer('First login for team: ' + team.name + ' token ' + team.tokenId + ' time: ' + toEkbString(team.firstLoginDate));
                this.saveTeamToDB(team);
            }

            return {
                authenticated: true,
                name: team.name,
                token: team.tokenId,
                admin: team.admin,
                first
            };
        }

        logServer('Incorrect login secret code access "' + secretCode + '"');
        return {authenticated: false};
    }

    private getNextStartFromStage() {
        let teams = this.dbStore.getTeams();
        const lastTeam = teams[teams.length - 1];
        const startFromStage = lastTeam.startFromStage;
        const nextStage = startFromStage + 1;
        if (nextStage < defaultData.stages.length) {
            return nextStage;
        }

        return 0;
    }

    private saveTeamToDB(team: Team, callback?: () => void) {
        this.dbStore.saveTeamDB(team, callback);
    }

    private static makeid() {
        let text = '';
        const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}
import {stageManager} from "./StageManager";
import {removeTeamDB, saveTeamDB, TEAMS_CACHE} from "./RedisClient";
import {toEkbString} from "./server";
import {defaultData} from "./data";
import {logServer} from "./utils";
export const COUNT_HOURS_TO_SOLVE = 7;

export class TeamManager {
    findTeamByCode(secretCode: string): Team {
        if (!secretCode) {
            return null;
        }
        for (let team of TEAMS_CACHE) {
            if (team.secretCode.toLocaleLowerCase() == secretCode.toLocaleLowerCase()) {
                return team;
            }
        }
        return null;
    }

    findTeamByToken(tokenId: string): Team {
        for (let team of TEAMS_CACHE) {
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

        const index = TEAMS_CACHE.indexOf(team);
        if (index == -1) {
            return false;
        }

        TEAMS_CACHE.splice(index, 1);
        delete stageManager.states[tokenId];
        logServer('ALERT: Removed team from app ' + team.name + " token: " + team.tokenId);

        removeTeamDB(team)

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

        TEAMS_CACHE.push(team);

        const token = team.tokenId;
        logServer('Added team to app: ' + team.name + ' ' + team.secretCode);
        this.saveTeamToDB(team, () => {
            logServer('Saved team to database: ' + team.name);
        });
        stageManager.saveAppStateToDB(token, (stageManager.getAppState(token)), () => {
            logServer('Saved state to database: ' + team.name);
        });

        return team;
    }

    listTeams(): Team[] {
        return TEAMS_CACHE;
    }

    login(secretCode: string): LoginInfo {
        const team = this.findTeamByCode(secretCode);
        if (team) {
            if (!team.firstLoginDate && !team.admin) {
                const date = new Date();

                const endDate = new Date(); //new object!
                endDate.setTime(date.getTime() + (COUNT_HOURS_TO_SOLVE * 60 * 60 * 1000));
                team.endQuestDate = endDate;
                team.firstLoginDate = date;

                logServer('First login for team: ' + team.name + ' token ' + team.tokenId + ' time: ' + toEkbString(team.firstLoginDate))
                this.saveTeamToDB(team);
            }

            return {
                authenticated: true,
                name: team.name,
                token: team.tokenId,
                admin: team.admin
            }
        }

        logServer('Incorrect login secret code access "' + secretCode + '"');
        return {authenticated: false}
    }

    private getNextStartFromStage() {
        const lastTeam = TEAMS_CACHE[TEAMS_CACHE.length - 1];
        const startFromStage = lastTeam.startFromStage;
        const nextStage = startFromStage + 1;
        if (nextStage < defaultData.stages.length) {
            return nextStage;
        }

        return 0;
    }

    private saveTeamToDB(team: Team, callback?: () => void) {
        saveTeamDB(team, callback);
    }

    private static makeid() {
        let text = "";
        const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 8; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}

export const teamManager: TeamManager = new TeamManager();
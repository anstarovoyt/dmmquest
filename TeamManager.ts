const COUNT_HOURS_TO_SOLVE = 6;

class TeamManager {
    findTeamByCode(secretCode:string):Team {
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

    findTeamByToken(tokenId:string):Team {
        for (let team of TEAMS_CACHE) {
            if (team.tokenId == tokenId) {
                return team;
            }
        }

        return null;
    }

    createTeam(name:string):Team {
        var secretCode = TeamManager.makeid();
        var newStartFrom = this.getNextStartFromStage();
        var team:Team = {
            name,
            secretCode,
            tokenId: secretCode,
            startFromStage: newStartFrom
        }

        TEAMS_CACHE.push(team);

        var token = team.tokenId;

        this.saveTeamToDB(team);
        stageManager.saveAppStateToDB(token, (stageManager.getAppState(token)));

        return team;
    }

    listTeams():Team[] {
        return TEAMS_CACHE;
    }

    login(secretCode:string):LoginInfo {
        var team = this.findTeamByCode(secretCode);
        if (team) {
            if (!team.firstLoginDate && !team.admin) {
                var date = new Date();

                var copiedDate = date;
                copiedDate.setTime(date.getTime() + (COUNT_HOURS_TO_SOLVE * 60 * 60 * 1000));
                team.endQuestDate = copiedDate;
                team.firstLoginDate = date;

                this.saveTeamToDB(team);
            }

            return {
                authenticated: true,
                name: team.name,
                token: team.tokenId,
                admin: team.admin
            }
        }
        return {authenticated: false}
    }

    private getNextStartFromStage() {
        var lastTeam = TEAMS_CACHE[TEAMS_CACHE.length - 1];
        var startFromStage = lastTeam.startFromStage;
        var nextStage = startFromStage + 1;
        if (nextStage < defaultData.stages.length) {
            return nextStage;
        }

        return 0;
    }

    private saveTeamToDB(team:Team, callback?:() => void) {
        client.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team), callback);
    }

    private static makeid() {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
}

var teamManager:TeamManager = new TeamManager();
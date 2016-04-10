class TeamImpl implements Team {
    name:string;
    secretCode:string;
    tokenId:string;
    startFromStage:number;
}

var TEAMS:Team[] = [];

TEAMS.push({
        name: "Тестовая админская команда",
        secretCode: "test",
        tokenId: "test",
        admin: true,
        startFromStage: 0
    },
    {
        name: "Самая тестовая команда 1",
        secretCode: "test2",
        tokenId: "test2",
        startFromStage: 1
    });

class TeamManager {
    findTeamByCode(secretCode:string):Team {
        if (!secretCode) {
            return null;
        }
        for (let team of TEAMS) {
            if (team.secretCode.toLocaleLowerCase() == secretCode.toLocaleLowerCase()) {
                return team;
            }
        }
        return null;
    }

    findTeamByToken(tokenId:string):Team {
        for (let team of TEAMS) {
            if (team.tokenId == tokenId) {
                return team;
            }
        }

        return null;
    }

    createTeam(name:string):Team {
        var secretCode = TeamManager.makeid();
        var newStartFrom = this.getNextStartFromStage();
        var team = {
            name,
            secretCode,
            tokenId: secretCode,
            startFromStage: newStartFrom
        }

        TEAMS.push(team);

        return team;
    }

    listTeams():Team[] {
        return TEAMS;
    }

    login(secretCode:string):LoginInfo {
        var team = this.findTeamByCode(secretCode);
        if (team) {
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
        var lastTeam = TEAMS[TEAMS.length - 1];
        var startFromStage = lastTeam.startFromStage;
        var nextStage = startFromStage + 1;
        if (nextStage < defaultData.stages.length) {
            return nextStage;
        }

        return 0;
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
var redis = require("redis");
var portArg = process.env.REDIS_URL;
var client = portArg ? redis.createClient(portArg) : redis.createClient();

client.on("error", function (err) {
    log('Error start redis listener');
});

log('Start redis client');

const TEAMS_KEY = "teams";
const APP_STATE_KEY = "app_state";

var TEAMS_CACHE:Team[] = [];

var initTeams = () => {
    var multi = client.multi();

    multi.hgetall(TEAMS_KEY, function (err, object) {
        var count = 0;
        for (var l in object) {
            if (object.hasOwnProperty(l)) {
                var value = object[l];
                var items = JSON.parse(value);
                if (items.firstLoginDate) {
                    var firstLoginDate:any = items.firstLoginDate;
                    var endDate:any = items.endQuestDate;
                    //fix date after serialization
                    items.firstLoginDate = new Date(firstLoginDate);
                    items.endQuestDate = new Date(endDate);
                }
                log('Load team ' + (count++) + ": " + items.name + ' token: ' + items.tokenId);

                TEAMS_CACHE.push(items);
            }
        }
    });

    multi.hgetall(APP_STATE_KEY, function (err, object) {
        if (!object) {
            log('ERROR! No states');
        }
        var count = 0;
        for (var l in object) {
            if (object.hasOwnProperty(l)) {
                var value = object[l];
                stageManager.states[l] = JSON.parse(value);
                log('Load state for team ' + (count++) + ': with token ' + l);
            }
        }
    });

    multi.exec(() => {
        initServer();
    })
}


client.exists(TEAMS_KEY, function (err, reply) {
    log('Database ' + reply ? "initialized" : "empty");
    var defaultTeams = getDefaultTeams();

    var toPush = {};
    var multi = client.multi();
    for (var team of defaultTeams) {
        multi.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team));
        multi.hset(APP_STATE_KEY, team.tokenId, JSON.stringify(initDefaultStateObject(team)));
        if (!reply) {
            TEAMS_CACHE.push(team);
        }

        log('Update or store default team: ' + team.name + ' token: ' + team.secretCode)
    }

    multi.exec(() => {
        if (reply) {
            initTeams();
        } else {
            initServer();
        }
    })
});


function getDefaultTeams() {
    var teams = [];

    teams.push({
            name: "Тестовая админская команда",
            secretCode: "test!test?",
            tokenId: "test+test-",
            admin: true,
            startFromStage: 0
        });

    return teams;

}

function initDefaultStateObject(team:Team) {


    var stages:Stage[] = [];
    var appState:AppState = {
        bonus: null,
        stages
    }

    var defaultStages = defaultData.stages;
    var startFromStage = team.startFromStage;
    var pushNumber:number = 0;
    for (var i = startFromStage; i < defaultStages.length; i++) {
        var status = i == startFromStage ? StageStatus.OPEN : StageStatus.LOCKED;
        stages.push({
            id: String(i),

            status: status,
            showNumber: pushNumber++
        });
    }

    for (var i = 0; i < startFromStage; i++) {
        var item:Stage = {
            id: String(i),
            status: StageStatus.LOCKED,
            showNumber: pushNumber++
        };
        stages.push(item);
    }

    stages[stages.length - 1].last = true;

    appState.bonus = {
        id: "bonus",
        status: StageStatus.BONUS,
        showNumber: pushNumber++
    }

    stageManager.states[team.tokenId] = appState;

    return appState;
}

function log(message:string) {
    console.log('DMM QUEST: ' + message);
}



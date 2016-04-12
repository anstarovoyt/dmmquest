var redis = require("redis");
var portArg = process.env.REDIS_URL;
var client = portArg ? redis.createClient(portArg) : redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

console.log('start redis client')

const TEAMS_KEY = "teams";
const APP_STATE_KEY = "app_state";

var TEAMS_CACHE:Team[] = [];

var initTeams = () => {
    client.hgetall(TEAMS_KEY, function (err, object) {
        console.log('get object ' + object);
        for (var l in object) {
            if (object.hasOwnProperty(l)) {
                var value = object[l];
                console.log(value);
                TEAMS_CACHE.push(JSON.parse(value));

                //todo load state
            }
        }
    });

    client.hgetall(APP_STATE_KEY, function (err, object) {
        console.log('get object ' + object);
        for (var l in object) {
            if (object.hasOwnProperty(l)) {
                var value = object[l];
                console.log(value);
                stageManager.states[l] = JSON.parse(value);

                //todo load state
            }
        }
    });
}


client.exists(TEAMS_KEY, function (err, reply) {
    if (reply) {
        initTeams();
        return;
    }

    var defaultTeams = getDefaultTeams();

    var toPush = {};
    var multi = client.multi();
    for (var team of defaultTeams) {
        multi.hset(TEAMS_KEY, team.tokenId, JSON.stringify(team));
        multi.hset(APP_STATE_KEY, team.tokenId, JSON.stringify(createDefaultStateObject(team)));
        TEAMS_CACHE.push(team);
    }

    multi.exec(function (res) {
        console.log('Inited database state');
    })
});


function getDefaultTeams() {
    var teams = [];

    teams.push({
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

    return teams;

}

function createDefaultStateObject(team:Team) {


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
        stages.push({
            id: String(i),
            status: StageStatus.LOCKED,
            showNumber: pushNumber++
        });
    }

    appState.bonus = {
        id: "bonus",
        status: StageStatus.BONUS,
        showNumber: pushNumber++
    }

    stageManager.states[team.tokenId] = appState;

    return appState;
}





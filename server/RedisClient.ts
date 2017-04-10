import {stageManager} from "./StageManager";
import {initServer} from "./server";
import {defaultData} from "./data";

const redis = require("redis");
const portArg = process.env.REDIS_URL;
export const client = portArg ? redis.createClient(portArg) : redis.createClient();

client.on("error", function (err) {
    log('Error start redis listener');
});

log('Start redis client');

export const TEAMS_KEY = "teams";
export const APP_STATE_KEY = "app_state";

export const TEAMS_CACHE: Team[] = [];

const initTeams = () => {
    const multi = client.multi();

    multi.hgetall(TEAMS_KEY, function (err, object) {
        let count = 0;
        for (let l in object) {
            if (object.hasOwnProperty(l)) {
                const value = object[l];
                const items = JSON.parse(value);
                if (items.firstLoginDate) {
                    const firstLoginDate: any = items.firstLoginDate;
                    const endDate: any = items.endQuestDate;
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
        let count = 0;
        for (let l in object) {
            if (object.hasOwnProperty(l)) {
                const value = object[l];
                stageManager.states[l] = JSON.parse(value);
                log('Load state for team ' + (count++) + ': with token ' + l);
            }
        }
    });

    multi.exec(() => {
        initServer();
    })
};


client.exists(TEAMS_KEY, function (err, reply) {
    log('Database ' + reply ? "initialized" : "empty");
    const defaultTeams = getDefaultTeams();

    const toPush = {};
    const multi = client.multi();
    for (let team of defaultTeams) {
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
    const teams = [];

    teams.push({
            name: "Тестовая админская команда",
            secretCode: "test+test-",
            tokenId: "test+test-",
            admin: true,
            startFromStage: 0
        });

    return teams;

}

export function initDefaultStateObject(team:Team) {
    const stages: Stage[] = [];
    const appState: AppState = {
        bonus: null,
        stages
    };
    const defaultStages = defaultData.stages;
    const startFromStage = team.startFromStage;
    let pushNumber: number = 0;
    for (let i = startFromStage; i < defaultStages.length; i++) {
        const status = i == startFromStage ? StageStatus.OPEN : StageStatus.LOCKED;
        stages.push({
            id: String(i),

            status: status,
            showNumber: pushNumber++
        });
    }

    for (let i = 0; i < startFromStage; i++) {
        const item: Stage = {
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

export function log(message:string) {
    console.log('DMM QUEST: ' + message);
}


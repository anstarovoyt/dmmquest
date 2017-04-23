import {defaultData} from './data';

const moment = require('moment');

export function logServer(message: string) {
    console.log('DMM QUEST: ' + message);
}

export function createDefaultAppState(team: Team) {
    const stages: Stage[] = [];
    const appState: AppState = {
        bonus: null,
        killer: null,
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
        id: 'bonus',
        status: StageStatus.BONUS,
        showNumber: pushNumber++
    };
    appState.killer = {
        id: 'killer',
        status: StageStatus.KILLER,
        showNumber: pushNumber++
    };

    return appState;
}


export function toEkbString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format('YYYY-MM-DD HH:mm');
}

export function toEkbOnlyTimeString(date) {
    return moment(date).tz('Asia/Yekaterinburg').format('HH:mm');
}

export function getCloseDate(date) {
    return moment(date).add('hours', 2).add('minutes', '30').tz('Asia/Yekaterinburg').format('HH:mm');
}

export function getDefaultTeams() {
    const teams: Team[] = [];

    teams.push({
        name: 'Тестовая админская команда',
        secretCode: 'зачемятаквчеранапился',
        tokenId: 'зачемятаквчеранапился',
        admin: true,
        startFromStage: 0
    });

    return teams;

}


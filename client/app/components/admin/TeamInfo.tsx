import * as React from 'react';
import {auth} from '../../authentication/AuthService';
import {appStateService} from '../../state/AppStateService';
import {removeTeam, unlockLastStage} from '../../communitation/Dispatcher';
import {StageElementComponent} from './StageElementComponent';

const Link: ReactRouter.Link = require('react-router/lib/Link');

export class TeamInfoComponent extends React.Component<{ info: TeamInfo, reloadParent: () => void }, { showInfo: boolean }> {


    constructor(props: { info: TeamInfo; reloadParent: (() => void) }, context: any) {
        super(props, context);

        this.state = {
            showInfo: false
        };
    }

    render() {
        const teamInfo = this.props.info;

        const team = teamInfo.team;

        const answers = this.getStatus();

        const unlockElement = this.getUnlockElement();

        let startStage: string = String(team.startFromStage + 1) + ', ' + teamInfo.stagesInfo[String(team.startFromStage)].realName;

        return (
            <div className="row">
                <div className="col-xs-18 col-md-12">
                    <h3>Команда {team.name}</h3>
                    <p><b>Секретный код</b>: {team.secretCode}</p>
                    <h4><a href="#"
                           className="hideShowLink"
                           onClick={this.hideOrShowPanel.bind(this)}>
                        {this.state.showInfo ? 'Hide info' : 'Show info'}
                    </a></h4>
                    <br/>

                    {this.state.showInfo ?
                        <div>
                            <p><b>Токен</b>: {team.tokenId}</p>
                            <p><b>Начальный этап (отсчет от 1)</b>: {startStage}</p>
                            <p>
                                Время первого
                                логина {teamInfo.firstLoginDateEkbTimezone ? teamInfo.firstLoginDateEkbTimezone : ' — не определено'}
                                <br />
                                Ожидаемое время
                                окончания {teamInfo.endQuestEkbTimezone ? teamInfo.endQuestEkbTimezone : ' — не определено'}
                            </p>
                            {answers}

                            <br />
                            <br />
                            <div>
                                {unlockElement ? <h4>{unlockElement}</h4> : ''}


                            </div>
                        </div> : ''}

                    <div>
                        {team.tokenId == auth.getToken() ? <h4>Это вы</h4> :
                            <h5 className="status-stage-right"><br/><a href="#"
                                                                       onClick={this.removeTeam.bind(this)}>Удалить</a>
                            </h5>}
                    </div>
                </div>
            </div>
        );
    }

    getUnlockElement() {
        let result = [];

        const teamInfo = this.props.info;

        let lastCompletedStage: Stage = null;
        for (let stage of teamInfo.appState.stages) {
            if (stage.status == StageStatus.COMPLETED) {
                lastCompletedStage = stage;
            }
        }


        if (lastCompletedStage == null) {
            return null;
        }

        if (lastCompletedStage) {
            result.push(<a key={'lastStage'} href="#"
                           onClick={this.unlockLastStage.bind(this)}>Разблокировать последний этап</a>);
        }

        if (teamInfo.appState.bonus.status == StageStatus.BONUS_COMPLETED) {
            result.push(<a key={'bonus'} href="#"
                           onClick={this.unlockBonusStage.bind(this)}>Разблокировать бонус этап</a>);
        }
        return result;
    }

    unlockLastStage(e) {
        e.preventDefault();
        this.unlockCommon();
    }

    unlockBonusStage(e) {
        e.preventDefault();
        this.unlockCommon('bonus');
    }

    unlockCommon(stageId?: string) {
        if (!window.confirm('Вы действительно хотите закрытый разблокировать этап?')) {
            return;
        }

        let toSend: UnlockLastCompletedStageRequest = {
            teamTokenId: this.props.info.team.tokenId,
            token: auth.getToken()
        };
        if (stageId) {
            toSend.stageId = stageId;
        }
        unlockLastStage(toSend, (res) => {
            if (res.success) {
                this.props.reloadParent();
            }
        });
    }

    hideOrShowPanel(e) {
        e.preventDefault();
        this.setState({
            showInfo: !this.state.showInfo
        });
    }

    removeTeam(e) {
        e.preventDefault();
        if (!window.confirm('Вы действительно хотите удалить команду?')) {
            return;
        }
        const teamInfo = this.props.info;
        const team = teamInfo.team;
        removeTeam({
            teamTokenId: team.tokenId,
            token: auth.getToken()
        }, (res) => {
            if (res.success) {
                this.props.reloadParent();
            }
        });
    }

    getStatus() {
        const result = [];
        const teamInfo = this.props.info;
        const i = 0;
        for (let stage of teamInfo.appState.stages) {
            result.push(<StageElementComponent key={stage.id} stage={stage} info={this.props.info}/>);
        }

        let bonus = teamInfo.appState.bonus;
        result.push((<StageElementComponent key={bonus.id} stage={teamInfo.appState.bonus} info={this.props.info}/>));
        let killer = teamInfo.appState.killer;
        result.push((<StageElementComponent key={killer.id} stage={killer} info={this.props.info}/>));

        return result;
    }


}
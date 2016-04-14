import * as React from "react";
import {auth} from "../../authentication/AuthService";
import {appStateService} from "../../state/AppStateService";
import {removeTeam} from "../../communitation/Dispatcher";

export class TeamInfoComponent extends React.Component<{info:TeamInfo, reloadParent:() => void}, any> {

    render() {
        var teamInfo = this.props.info;

        var team = teamInfo.team;

        var answers = this.getStatus();
        return (
            <div className="row">
                <div className="col-xs-12 col-md-8">
                    <h3>Команда {team.name}</h3>
                    <p><b>Секретный код</b>: {team.secretCode}</p>
                    <p><b>Токен</b>: {team.tokenId}</p>
                    <p><b>Начальный этап (отсчет от 1)</b>: {team.startFromStage + 1}</p>
                    <p>
                        Время первого логина {teamInfo.firstLoginDateEkbTimezone ? teamInfo.firstLoginDateEkbTimezone : " — не определено"}
                        <br />
                        Ожидаемое время окончания {teamInfo.endQuestEkbTimezone ? teamInfo.endQuestEkbTimezone : " — не определено"}
                    </p>
                    {answers}

                    <br />
                    <br />
                    <div>
                        {team.tokenId == auth.getToken() ? <h4>Это вы</h4> :
                            <h4><a href="#"
                                   onClick={this.removeTeam.bind(this)}>Удалить</a>
                            </h4>}

                    </div>
                </div>

            </div>
        )
    }

    removeTeam(e) {
        e.preventDefault();
        if (!window.confirm('Вы действительно хотите удалить команду?')) {
            return;
        }
        var teamInfo = this.props.info;
        var team = teamInfo.team;
        removeTeam({
            teamTokenId: team.tokenId,
            token: auth.getToken()
        }, (res) => {
            if (res.success) {
                this.props.reloadParent();
            }
        })
    }

    getStatus() {
        var result = [];
        var teamInfo = this.props.info;
        var i = 0;
        for (var stage of teamInfo.appState.stages) {
            result.push(this.getStageElement(stage))

        }

        result.push(this.getStageElement(teamInfo.appState.bonus));

        return result;
    }


    getStageElement(stage:Stage) {
        var stageNumber = stage.status == StageStatus.BONUS ? "Бонус" : Number(stage.id) + 1;
        return <span key={stage.id}>
                <b>Этап {stageNumber}</b>: {appStateService.getStageNameById(stage.id)}
            — <b>{this.getStageStatusText(stage.status)}</b>
            <div>
                {this.getAnswers(stage)}
            </div>
                </span>
    }

    getStageStatusText(status:StageStatus) {
        if (status == StageStatus.OPEN) {
            return "В процессе"
        }

        if (status == StageStatus.COMPLETED) {
            return "Сдан"
        }

        if (status == StageStatus.BONUS) {
            return "Бонус"
        }

        return "Не открыт"
    }

    getAnswers(stage:Stage) {
        var result = [];

        var questAnswers = stage.questAnswers;
        for (var answerId in questAnswers) {
            if (questAnswers.hasOwnProperty(answerId)) {
                result.push(<p key={answerId}>&nbsp;&nbsp;&nbsp;Вопрос {Number(answerId) + 1}
                    — {questAnswers[answerId].answer} </p>)
            }
        }

        return result;
    }
}
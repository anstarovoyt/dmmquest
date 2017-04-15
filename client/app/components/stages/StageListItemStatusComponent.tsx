import * as React from "react"

export class StageListItemStatusComponent extends React.Component<{ stageStatus: StageStatus }, any> {


    render() {
        var stageStatus: StageStatus = this.props.stageStatus;

        if (stageStatus == StageStatus.OPEN) {
            return <div className="alert alert-info">В процессе
            </div>
        }
        if (stageStatus == StageStatus.COMPLETED) {
            return <div className="alert alert-success"> Завершен</div>
        }

        if (stageStatus == StageStatus.BONUS) {
            return <div className="alert alert-success"> Бонус</div>
        }

        if (stageStatus == StageStatus.INTRO) {
            return <div className="alert alert-success"> Intro</div>
        }

        if (stageStatus == StageStatus.KILLER || stageStatus == StageStatus.KILLER_COMPLETED) {
            return <div className="alert alert-success"> Killer</div>
        }

        return <div className="alert alert-danger">Не открыт</div>
    }
}
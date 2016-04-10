import * as React from "react"

export class StageListItemStatusComponent extends React.Component<{stage:Stage}, any> {


    render() {
        var stage:Stage = this.props.stage;
        var stageStatus = stage.status;
        
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

        return <div className="alert alert-danger">Не открыт</div>
    }
}
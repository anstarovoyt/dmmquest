import * as React from 'react';

export class StageListItemStatusComponent extends React.Component<{ stageStatus: StageStatus, stage: Stage | null }, any> {


    render() {

        let stage = this.props.stage;
        const stageStatus: StageStatus = this.props.stageStatus;

        if (stageStatus == StageStatus.OPEN) {
            if (stage.expectedClosedTime) {
                const date = stage.expectedClosedTime;
                return <div className="alert alert-info">Закрыть до {date} </div>;
            }

            return <div className="alert alert-info">В процессе</div>;
        }
        if (stageStatus == StageStatus.COMPLETED) {
            return <div className="alert alert-success"> Завершен</div>;
        }

        if (stageStatus == StageStatus.BONUS) {
            return <div className="alert alert-success"> Бонус</div>;
        }

        if (stageStatus == StageStatus.INTRO) {
            return <div className="alert alert-success"> Intro</div>;
        }

        if (stageStatus == StageStatus.KILLER || stageStatus == StageStatus.KILLER_COMPLETED) {
            return <div className="alert alert-success"> Killer</div>;
        }

        return <div className="alert alert-danger">Не открыт</div>;
    }
}
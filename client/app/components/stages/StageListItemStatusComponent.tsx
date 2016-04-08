import * as React from "react"

export class StageListItemStatusComponent extends React.Component<{stage:Stage}, any> {


    render() {
        var stage:Stage = this.props.stage;
        if (stage.isOpen) {
            return <div className="alert alert-info">В процессе
            </div>
        }

        if (stage.isCompleted) {
            return <div className="alert alert-success"> Завершен</div>
        }

        return <div className="alert alert-danger">Не открыт</div>
    }
}
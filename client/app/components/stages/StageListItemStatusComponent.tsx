import * as React from "react"

export class StageListItemStatusComponent extends React.Component<{stage:Stage}, any> {


    render() {
        var stage:Stage = this.props.stage;
        if (stage.isOpen) {
            return <div className="alert alert-info"><span className="glyphicon glyphicon-forward"></span> В процессе
            </div>
        }

        if (stage.isLocked) {
            return <div className="alert alert-danger"><span className="glyphicon glyphicon-remove-sign"></span>
                Не открыт</div>
        }
        
        if (stage.isCompleted) {
            return <div className="alert alert-success"><span className="glyphicon glyphicon-ok"></span> Завершен</div>
        }
    }
}
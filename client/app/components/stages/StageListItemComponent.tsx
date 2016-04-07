import * as React from "react"

import {Link} from 'react-router';
import {StageListItemStatusComponent} from "./StageListItemStatusComponent";


export class StageListItemComponent extends React.Component<{stage:Stage}, any> {

    constructor(props:{stage:Stage}, context:any) {
        super(props, context);
    }

    render() {
        var stage = this.props.stage;
        var id = stage.id;
        var stageLink = "stage/" + id;
        return <div className="row">
            <div className="col-xs-12 col-md-8">
                <Link to={stageLink}>{this.getName(stage)}</Link>
            </div>
            
            <div className="col-xs-6 col-md-4">
                <StageListItemStatusComponent stage={stage}/>
            </div>
        </div>
    }


    getName(stage:Stage) {
        if (stage.isBonus) {
            return "Бонус :)"
        }
        return "Этап " + (stage.id + 1);
    }
}
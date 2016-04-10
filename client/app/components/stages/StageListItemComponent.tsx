import * as React from "react";
var Link = require('react-router/lib/Link');
import {StageListItemStatusComponent} from "./StageListItemStatusComponent";
import {appStateService} from "../../state/AppStateService";


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
                <h4><Link to={stageLink}>{this.getName(stage)}</Link></h4>
            </div>

            <div className="col-xs-6 col-md-4">
                <StageListItemStatusComponent stage={stage}/>
            </div>
        </div>
    }


    getName(stage:Stage) {
        return appStateService.getStageName(stage);
    }
}
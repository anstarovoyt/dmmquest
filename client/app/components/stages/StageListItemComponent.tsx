import * as React from "react"

import {Link} from 'react-router';


export class StageListItemComponent extends React.Component<{stage:Stage}, any> {

    constructor(props:{stage:Stage}, context:any) {
        super(props, context);
    }

    render() {
        var id = this.props.stage.id;
        var stageLink = "stage/" + id;
        return (
            <div>
                
                <Link to={stageLink}>Stage {id}</Link>
                <div>
                    status
                </div>
            </div>)
    }
}
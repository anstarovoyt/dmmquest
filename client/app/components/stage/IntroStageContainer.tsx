import * as React from "react";
import {appStateService} from "../../state/AppStateService";
var Link = require('react-router/lib/Link');


export class IntroStageContainer extends React.Component<any, any> {

    render() {

        let intro = appStateService.getIntro();

        return <div className="row">
            <div className="col-lg-12">
                <h1><Link to="/">
                    <span className="glyphicon glyphicon-arrow-left"></span>
                </Link>

                    <div className="row">
                        <div className="col-xs-12 col-md-8">
                            <div dangerouslySetInnerHTML={{__html: intro}}/>
                        </div>
                    </div>

                </h1>
            </div>
        </div>;
    }
}
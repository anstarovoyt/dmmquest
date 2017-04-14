import * as React from "react";
import {appStateService} from "../../state/AppStateService";
import {StageContainerComponent} from "./StageContainerComponent";
import {LoadingComponent} from "../common/LoadingComponent";

var Link = require('react-router/lib/Link');


export class IntroStageContainer extends StageContainerComponent {

    render() {
        if (!appStateService.getAppState()) {
            return <LoadingComponent/>;
        }

        let intro = appStateService.getIntro();

        return <div className="row">
            <div className="col-lg-12">
                <h1><Link to="/">
                    <span className="glyphicon glyphicon-arrow-left"></span>
                </Link>
                    Intro
                </h1>
                <div className="row">
                    <div className="col-xs-12 col-md-8">
                        <div dangerouslySetInnerHTML={{__html: intro}}/>
                    </div>
                </div>
            </div>
        </div>;
    }
}
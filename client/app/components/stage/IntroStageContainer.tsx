import * as React from "react";
var Link = require('react-router/lib/Link');


export class IntroStageContainer extends React.Component<any, any> {

    render() {
        return <div className="row">
            <div className="col-lg-12">
                <h1><Link to="/">
                    <span className="glyphicon glyphicon-arrow-left"></span>
                </Link>
                </h1>
            </div>
        </div>;
    }
}
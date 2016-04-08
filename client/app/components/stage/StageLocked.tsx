import * as React from "react"
import {Link} from 'react-router'


export class StageLocked extends React.Component<any, any> {

    render() {

        return <div className="row">
            <div className="col-lg-12">
                <h1><Link to="/">
                    <span className="glyphicon glyphicon-arrow-left"></span>
                </Link>
                    <span>Этап недоступен</span></h1>
            </div>
        </div>
    }
}
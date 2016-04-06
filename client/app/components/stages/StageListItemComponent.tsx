import * as React from "react"

import {Link} from 'react-router';


export default class StagesComponent extends React.Component<any, any> {

    render() {

        return (
            <div>
                <Link to="stage/1">Stage 1</Link>
                <div>
                    status
                </div>
            </div>)
    }
}
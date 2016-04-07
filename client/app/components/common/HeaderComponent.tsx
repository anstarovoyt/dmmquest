import * as React from "react"
import {authStore} from "../../authentication/AuthStore";
import {auth} from "../../authentication/AuthService";

import {Link} from 'react-router'


export class HeaderComponent extends React.Component<any, any> {

    render() {

        return <div className="masthead clearfix">
            <div className="inner">
                <h3 className="masthead-brand"><Link to="/">ДММ Квест</Link></h3>
                <ul className="nav masthead-nav">
                    <li><a onClick={this.logout.bind(this)}>Выйти</a></li>
                </ul>
            </div>
        </div>
    }

    private logout() {
        auth.logout();
    }
}
import * as React from "react"
import {authStore} from "../../authentication/AuthStore";
import {auth} from "../../authentication/AuthService";

import {Link} from 'react-router'


export class HeaderComponent extends React.Component<any, any> {

    render() {

        return     <div className="header-wrap">

            <div className="masthead clearfix">
                <div className="inner">
                    <h3 className="masthead-brand"><span className="glyphicon glyphicon-picture"></span></h3>
                    <ul className="nav masthead-nav">
                        <li className="active"><Link to="/">Главная</Link></li>
                        <li><a href="#">Эбаут</a></li>
                        <li><a onClick={this.logout.bind(this)}>Выход</a></li>

                    </ul>
                </div>
            </div>
        </div>
    }

    private logout() {
        auth.logout();
    }
}
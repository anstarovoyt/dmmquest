import * as React from "react";
import {auth} from "../../authentication/AuthService";
import Link from "react-router/lib/Link";

export class HeaderComponent extends React.Component<any, any> {

    render() {

        return     <div className="header-wrap">

            <div className="masthead clearfix">
                <div className="inner">
                    <h3 className="masthead-brand"><Link className="logo-picture" to="/"></Link></h3>
                    <ul className="nav masthead-nav">
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/stage/bonus">Бонус</Link></li>
                        <li><a href="#" onClick={this.logout.bind(this)}>Выход</a></li>

                    </ul>
                </div>
            </div>
        </div>
    }

    private logout() {
        auth.logout();
    }
}
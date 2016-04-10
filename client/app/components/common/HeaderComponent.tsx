import * as React from "react";
import {auth} from "../../authentication/AuthService";

var Link = require('react-router/lib/Link');


export class HeaderComponent extends React.Component<any, any> {

    render() {

        var buttons = []
        buttons.push(<li key="/"><Link to="/">Главная</Link></li>);
        buttons.push(<li key="/bonus"><Link to="/bonus">Бонус</Link></li>);
        if (auth.isAdmin()) {
            buttons.push(<li key="/admin"><Link to="/admin">Админ</Link></li>);
        }
        buttons.push(<li key="/logout"><a href="#" onClick={this.logout.bind(this)}>Выход</a></li>);
        return     <div className="header-wrap">

            <div className="masthead clearfix">
                <div className="inner">
                    <h3 className="masthead-brand"><Link className="logo-picture" to="/"></Link></h3>
                    <ul className="nav masthead-nav">
                        {buttons}
                    </ul>
                </div>
            </div>
        </div>
    }

    private logout() {
        auth.logout();
    }
}
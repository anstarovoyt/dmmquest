import * as React from "react"

import {auth} from '../../authentication/AuthService'
import {LoginForm} from "../login/LoginForm";
import {authStore} from "../../authentication/AuthStore"
import {HeaderComponent} from "../common/HeaderComponent";
import {FooterComponent} from "../common/FooterComponent";

export default class Placeholder extends React.Component<{ children:any }, {loginInfo:LoginInfo}> {

    private _changeListener:()=> void;

    constructor(props) {
        super(props);
        this.state = {loginInfo: auth.logginInfo()}
    }

    _onChange(loginInfo:LoginInfo) {
        this.setState({loginInfo});
        console.log('update holder')
    }


    render() {
        var loginInfo = this.state.loginInfo;
        if (loginInfo && loginInfo.authenticated) {
            return (<div className="cover-container">
                    <HeaderComponent />

                    <div className="inner cover">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{loginInfo.name}</h1>

                                {this.props.children}
                            </div>
                        </div>
                    </div>
                    <FooterComponent />
                </div>
            )
        }

        return (
            <div className="cover-container">
                <LoginForm />
                <FooterComponent />
            </div>
        )
    }


    componentWillMount() {
        this._changeListener = this._onChange.bind(this);
        authStore.addChangeListener(this._changeListener);
    }


    componentWillUnmount() {
        authStore.removeChangeListener(this._changeListener);
        this._changeListener = null;
    }
}
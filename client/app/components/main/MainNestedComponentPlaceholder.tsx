import * as React from "react";
import {auth} from "../../authentication/AuthService";
import {LoginForm} from "../login/LoginForm";
import {authStore} from "../../authentication/AuthStore";
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
    }


    render() {

        var loginInfo = this.state.loginInfo;
        if (loginInfo && loginInfo.authenticated) {
            return (<div>
                <HeaderComponent/>
                <div className="cover-container">
                    <div className="inner cover">
                        {this.props.children}
                    </div>
                </div>
                <FooterComponent/>
            </div>)
        }

        return (
            <div className="site-wrapper-inner">
                <div className="cover-container">
                    <LoginForm />
                </div>
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
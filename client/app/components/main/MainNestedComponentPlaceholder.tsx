import * as React from "react"

import {auth} from '../../authentication/AuthService'
import {LoginForm} from "../login/LoginForm";
import {authStore} from "../../authentication/AuthStore"

export default class Placeholder extends React.Component<{ children:any }, {loggedIn:boolean}> {

    private _changeListener:()=> void;

    constructor(props) {
        super(props);
        this.state = {loggedIn: auth.loggedIn()}
    }

    _onChange(loginInfo:LoginInfo) {
        this.setState({loggedIn: loginInfo.authenticated});
        console.log('update holder')
    }


    render() {
        if (this.state.loggedIn) {
            return this.props.children;
        }

        return <LoginForm />
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
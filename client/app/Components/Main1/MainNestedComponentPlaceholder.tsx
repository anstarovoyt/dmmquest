import * as React from "react"

import auth from '../../authentication/AuthService'
import {LoginForm} from "../Login/LoginForm";
import AuthStore from "../../authentication/AuthStore"

export default class Placeholder extends React.Component<{ children: any }, {loggedIn: boolean}> {

	private _changeListener: ()=> void;

	constructor(props) {
		super(props);
		this.state = {loggedIn: auth.loggedIn()}
	}

	_onChange() {
		this.setState({loggedIn: auth.loggedIn()});
		console.log('update holder')
	}


	render(): JSX.Element {
		if (this.state.loggedIn) {
			return this.props.children;
		}

		return <LoginForm/>
	}


	componentWillMount() {
		this._changeListener = this._onChange.bind(this);
		AuthStore.addChangeListener(this._changeListener);
	}



	componentWillUnmount() {
		AuthStore.removeChangeListener(this._changeListener);
		this._changeListener = null;
	}
}
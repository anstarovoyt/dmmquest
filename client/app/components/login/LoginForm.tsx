import * as React from "react";
import {auth} from "../../authentication/AuthService";


export class LoginForm extends React.Component<any, {secretCode:string}> {


    constructor() {
        super();
        this.state = {secretCode: ""};
    }

    render() {
        return (
            <div className="inner cover">
                <p className="lead">
                    <form className="input-group" onSubmit={this.handleSubmit.bind(this)}>
                        
                            <input value={this.state.secretCode}
                                   onChange={this.handleCodeChanged.bind(this)}
                                   className="form-control"
                                   type="text"
                                   placeholder="Введите секретный код"/>
			                <span className="input-group-btn">
			                    <button className="btn btn-info" type="button">
                                    <span className="glyphicon glyphicon-fire"></span> Вперед</button>
			                </span>
                    </form>
                </p>
            </div>

        )
    }

    handleCodeChanged(event) {
        this.setState({
            secretCode: event.target.value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        auth.login(this.state.secretCode);
    }

}
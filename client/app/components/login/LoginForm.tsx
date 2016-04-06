import * as React from "react";
import {auth} from "../../authentication/AuthService";

export class LoginForm extends React.Component<any, {secretCode:string}> {


    constructor() {
        super();
        this.state = {secretCode: ""};
    }

    render() {
        return (
            <div>
                <form className="commentForm" onSubmit={this.handleSubmit.bind(this)}>
                    <input value={this.state.secretCode}
                           onChange={this.handleCodeChanged.bind(this)}
                           type="text"
                           placeholder="Введите свой секретный код"/>

                    <button>Login</button>
                </form>
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
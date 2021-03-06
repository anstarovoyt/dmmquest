import * as React from "react";
import {auth} from "../../authentication/AuthService";
import {PropTypes} from "react";


export class LoginForm extends React.Component<any, { secretCode: string, showError: boolean }> {

    constructor() {
        super();
        this.state = {
            secretCode: "",
            showError: false
        };
    }

    static contextTypes = {
        history: PropTypes.object.isRequired
    };


    componentWillMount(): void {
        document.body.classList.add('open');
        document.getElementById('content').classList.add('site-wrapper')
    }

    componentWillUnmount(): void {
        document.body.classList.remove('open');
        document.getElementById('content').classList.remove('site-wrapper')
    }

    render() {
        var notAvailableClass = "not-avaliable" + (this.state.showError ? " view" : "");
        var errorNoLocalStorage = "not-avaliable" + (typeof localStorage == 'undefined' || auth.noLocalStorage() ? " view" : "");


        return (
            <form className="inner cover" onSubmit={this.handleSubmit.bind(this)}>
                <p className="lead"></p>
                <div className="input-group">
                    <input value={this.state.secretCode}
                           onChange={this.handleCodeChanged.bind(this)}
                           className="form-control"
                           type="text"
                           placeholder="Введите секретный код"/>
                    <span className="input-group-btn">
			                    <button className="btn btn-info" type="submit">
                                    <span className="glyphicon glyphicon-fire"></span> Вперед</button>
			                </span>
                </div>
                <p className={notAvailableClass}>Код введен неверно</p>
                <p className={errorNoLocalStorage}>
                    Возможны проблемы со входом из-за старого браузера или режима приватности</p>
            </form>

        )
    }

    handleCodeChanged(event) {
        this.setState({
            secretCode: event.target.value,
            showError: false
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        auth.login(this.state.secretCode, (res) => {
            if (!res.success) {
                this.setState({
                    secretCode: "",
                    showError: true
                })
            } else if (res.redirect) {
                this.context["history"].push('/intro');
            }
        });
    }

}
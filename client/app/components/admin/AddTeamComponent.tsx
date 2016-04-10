import * as React from "react";
import {addTeam} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";

export class AddTeamComponent extends React.Component<{reloadParent:() =>void}, {value:string}> {

    constructor(props:any, context:any) {
        super(props, context);
        this.state = {
            value: null
        };
    }

    render():JSX.Element {
        return  <div className="row">
            <div className="col-xs-12 col-md-8">
                <h4>Добавление команды:</h4>
                <p className="lead"></p>
                <div className="input-group">
                    <input type="text"
                           className="form-control"
                           value={this.state.value}
                           onChange={this.handlerChanged.bind(this)}/>

                            <span className="input-group-btn">
                              <button
                                  className="btn btn-info" type="button" onClick={this.add.bind(this)}>
                                  <span className="glyphicon glyphicon-floppy-save"></span> Добавить</button>
                            </span>
                </div>
            </div>
        </div>
    }

    handlerChanged(e) {
        var newValue = e.target.value;
        this.setState({value: newValue});
    }

    add() {
        var value = this.state.value;
        if (value) {
            addTeam({
                teamName: value,
                token: auth.getToken()
            }, (res) => {
                if (res.success) {
                    this.props.reloadParent();
                }
            })
        }
    }
}
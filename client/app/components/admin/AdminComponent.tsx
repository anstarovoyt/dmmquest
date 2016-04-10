import * as React from "react";
import {AddTeamComponent} from "./AddTeamComponent";
import {loadTeam} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";
import {LoadingComponent} from "../common/LoadingComponent";
import {TeamInfoComponent} from "./TeamInfo";

export class AdminComponent extends React.Component<any, {hasAccess:boolean, teams:TeamInfo[]}> {

    constructor(props:any, context:any) {
        super(props, context);

        this.state = {
            hasAccess: auth.isAdmin(),
            teams: null
        }
    }

    componentDidMount() {
        loadTeam({
            token: auth.getToken()
        }, (res) => {
            this.setState({
                hasAccess: res.success,
                teams: res.teams
            })
        });
    }

    render():JSX.Element {
        if (!this.state.hasAccess) {
            return <div className="col-lg-12 save-level">
                Access denied
            </div>
        }
        var teams = this.state.teams;
        if (!teams) {
            return <LoadingComponent/>
        }
        var result = teams.map(function (team) {
            return <TeamInfoComponent key={team.team.secretCode} info={team}/>
        });

        return <div className="row">
                <div className="col-lg-12">
                    <AddTeamComponent/>
                    {result}
                </div>
            </div>
    }
}
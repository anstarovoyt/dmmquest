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
        this.reloadState();
    }


    private reloadState() {
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

        var rawTeams = this.state.teams;
        
        if (!rawTeams) {
            return <LoadingComponent/>
        }

        var teams = rawTeams.reverse();
        

        var reloadParent = this.reloadState.bind(this);
        var result = teams.map(function (team) {
            return <TeamInfoComponent reloadParent={reloadParent} key={team.team.secretCode} info={team}/>
        });


        return <div className="row">
            <div className="col-lg-12">
                <AddTeamComponent reloadParent={reloadParent}/>
                <div className="row">
                    <div className="col-xs-12 col-md-8">
                        <h4>Всего команд: {teams.length}</h4>
                    </div>
                </div>
                {result}
            </div>
        </div>
    }
}
import * as React from "react";
import {appStateStore} from "../../state/AppStateStore";
import {appStateService} from "../../state/AppStateService";
import {LoadingComponent} from "../common/LoadingComponent";
import {StageListItemComponent} from "./StageListItemComponent";
import {auth} from "../../authentication/AuthService";


export class StagesListComponent extends React.Component<any, {stages:Stage[],loading:boolean}> {

    private _changeListener;

    constructor(props:any, context:any) {
        super(props, context);

        var state:AppState = appStateService.getState();
        if (!state) {
            this.state = {loading: true, stages: null};
        } else {
            this.state = {stages: state.stages, loading: false}
        }
    }


    _onChange(appState:AppState) {
        console.log('update state stage container');

        var state = appState == null ? {loading: false, stages: null} : {
            stages: appState.stages,
            loading: false
        };
        this.setState(state);
    }


    componentWillMount() {
        this._changeListener = this._onChange.bind(this);
        appStateStore.addChangeListener(this._changeListener);
        appStateService.updateState();
    }

    componentWillUnmount() {
        appStateStore.removeChangeListener(this._changeListener);
        this._changeListener = null;
    }

    render() {

        if (this.state.loading) {
            return (
                <div className="row">
                    <div className="col-lg-12">
                        <h1>{auth.getName()}</h1>

                        <LoadingComponent/>
                    </div>
                </div>
            )

        }
        var stages = this.state.stages;
        if (stages) {
            var result = stages.map(function (el) {
                return <StageListItemComponent key={el.id} stage={el}/>
            })
            return <div className="row">
                <div className="col-lg-12">
                    <h1>{auth.getName()}</h1>
                    {result}
                </div>
            </div>
        }
    }
}
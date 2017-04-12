import * as React from "react";
import {appStateStore} from "../../state/AppStateStore";
import {appStateService} from "../../state/AppStateService";
import {LoadingComponent} from "../common/LoadingComponent";
import {StageListItemComponent} from "./StageListItemComponent";
import {auth} from "../../authentication/AuthService";
import {IntroStageContainer} from "../stage/IntroStageContainer";
import {IntroStageListItemComponent} from "./IntroStageListItemComponent";


export class StagesListComponent extends React.Component<any, { stages: Stage[], bonus: Stage, loading: boolean }> {

    private _changeListener;

    constructor(props: any, context: any) {
        super(props, context);

        var state: AppState = appStateService.getAppState();
        if (!state) {
            this.state = {loading: true, stages: null, bonus: null};
        } else {
            this.state = {stages: state.stages, bonus: state.bonus, loading: false}
        }
    }


    _onChange(appState: AppState) {
        var state = appState == null ? {loading: false, stages: null, bonus: null} : {
            stages: appState.stages,
            loading: false,
            bonus: appState.bonus
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

        var state = this.state;
        if (state.loading || !state.stages) {
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
        var result = [<IntroStageListItemComponent />];
        result = result.concat(stages.map(function (el) {
            return <StageListItemComponent key={el.id} stage={el}/>
        }));

        let el = state.bonus;
        if (el) {
            result.push(<StageListItemComponent key={el.id} stage={el}/>)
        }

        return <div className="row">
            <div className="col-lg-12">
                <h1>{auth.getName()}</h1>
                {result}
            </div>
        </div>
    }
}
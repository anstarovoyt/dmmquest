import * as React from "react";
import {appStateService} from "../../state/AppStateService";
import {StageComponent} from "./StageComponent";
import {appStateStore} from "../../state/AppStateStore";
import {LoadingComponent} from "../common/LoadingComponent";
import {StageLocked} from "./StageLocked";


type StageStage = {stage:Stage, loading:boolean, available:boolean};

export class StageContainerComponent extends React.Component<{params:any},StageStage > {

    private _changeListener:(p:AppState)=>void;


    constructor(props:any, context:any) {
        super(props, context);
        var state:AppState = appStateService.getState();
        this.state = this.getStageByAppState(state);
    }

    _onChange(appState:AppState) {
        console.log('update state stage container');
        this.setState(this.getStageByAppState(appState));
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

    private getStageByAppState(state:AppState):StageStage {
        console.log('test state');
        if (!state) {
            return {
                loading: true,
                available: false,
                stage: null
            };
        }
        else {
            var id:string = this.props.params.id;
            if (id) {
                var numberId = id == 'bonus' ? state.stages.length - 1 : Number(id);
                if (id) {
                    var stage = state.stages[numberId];
                    if (stage) {
                        return {
                            stage,
                            loading: false,
                            available: true
                        }
                    }
                }
            }
        }

        return {
            available: false,
            loading: false,
            stage: null
        }
    }

    render() {
        var state = this.state;
        if (state) {
            if (false === state.available) {
                return <StageLocked />
            }
            var stage = state.stage;
            if (stage) {
                if (stage.isLocked) {
                    return <StageLocked />
                }
                return <StageComponent stage={stage}/>
            }
        }

        return <LoadingComponent/>;
    }
}
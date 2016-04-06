import * as React from "react"
import {appStateService} from "../../state/AppStateService";
import {StageComponent} from "./StageComponent";
import {appStateStore} from "../../state/AppStateStore";
import {LoadingComponent} from "../common/LoadingComponent";


type StageStage = {stage?:Stage, loading?:boolean, notAvailable?:boolean};

export class StageContainerComponent extends React.Component<{params:any},StageStage > {

    private _changeListener:(p:AppState)=>void;


    constructor(props:any, context:any) {
        super(props, context);
        var state:AppState = appStateService.getState();
        this.state = this.getStageByAppState(state);
    }

    _onChange(loginInfo:AppState) {
        console.log('update state stage container');
        this.setState(this.getStageByAppState(loginInfo));
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
            return {loading: true};
        }
        else {
            var id:string = this.props.params.id;
            console.log(id);
            console.log(JSON.stringify(state));
            if (id) {
                var numberId = Number(id);
                if (id) {
                    var stage = state.stages[numberId];
                    if (stage) {
                        return {
                            stage,
                            loading: false
                        }
                    }
                }
            }
        }

        return {
            notAvailable: true
        }
    }

    render() {
        var state = this.state;
        if (state) {
            if (state.notAvailable) {
                return <div>Этап недоступен</div>
            }
            if (state.stage) {
                return <StageComponent stage={state.stage}/>
            }
        }

        return <LoadingComponent/>;
    }
}
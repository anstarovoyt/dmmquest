import * as React from "react";
import {appStateService, getStageById} from "../../state/AppStateService";
import {StageComponent} from "./StageComponent";
import {appStateStore} from "../../state/AppStateStore";
import {LoadingComponent} from "../common/LoadingComponent";
import {StageLocked} from "./StageLocked";
import {KillerStageComponent} from "./KillerStageComponent";

type StageStage = { stage: Stage, loading: boolean, available: boolean };

export class StageContainerComponent extends React.Component<any, StageStage> {

    private _changeListener: (p: AppState) => void;


    constructor(props: any, context: any) {
        super(props, context);
        const state: AppState = appStateService.getAppState();
        this.state = this.getStageByAppState(state);
    }

    _onChange(appState: AppState) {
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

    private getStageByAppState(state: AppState): StageStage {
        if (!state) {
            return {
                loading: true,
                available: false,
                stage: null
            };
        }
        else {
            const id: string = this.getStageId();
            if (id) {
                const stage = getStageById(state, id);
                if (stage) {
                    return {
                        stage,
                        loading: false,
                        available: true
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

    getStageId() {
        return (this.props as any).params.id;
    }

    render() {
        const state = this.state;
        if (state) {
            if (false === state.available) {
                return <StageLocked />
            }
            const stage = state.stage;
            if (stage) {
                if (stage.status == StageStatus.LOCKED) {
                    return <StageLocked />
                }
                return this.createStageComponent(stage);
            }
        }

        return <LoadingComponent/>;
    }

    createStageComponent(stage: Stage) {
        if (stage.status == StageStatus.KILLER || stage.status == StageStatus.KILLER_COMPLETED) {
            return <KillerStageComponent stage={stage}/>;
        }
        return <StageComponent stage={stage}/>;
    }
}
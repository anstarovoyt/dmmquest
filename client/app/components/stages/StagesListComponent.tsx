import * as React from 'react';
import {appStateStore} from '../../state/AppStateStore';
import {appStateService} from '../../state/AppStateService';
import {LoadingComponent} from '../common/LoadingComponent';
import {StageListItemComponent} from './StageListItemComponent';
import {auth} from '../../authentication/AuthService';
import {IntroStageContainer} from '../stage/IntroStageContainer';
import {IntroStageListItemComponent} from './IntroStageListItemComponent';
import {KillerResultListItemComponent} from './KillerResultListItemComponent';


type StateList = {
    stages: Stage[],
    bonus: Stage,
    killer?: Stage,
    loading: boolean
};

export class StagesListComponent extends React.Component<any, StateList> {

    private _changeListener;

    constructor(props: any, context: any) {
        super(props, context);

        var state: AppState = appStateService.getAppState();
        if (!state) {
            this.state = {loading: true, stages: null, bonus: null, killer: null};
        } else {
            this.state = {stages: state.stages, bonus: state.bonus, killer: state.killer, loading: false};
        }
    }


    _onChange(appState: AppState) {
        const state = appState == null ? {loading: false, stages: null, bonus: null} : {
            stages: appState.stages,
            loading: false,
            bonus: appState.bonus,
            killer: appState.killer
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
            );
        }


        var stages = this.state.stages;
        var result = [<IntroStageListItemComponent key="intro"/>];
        result = result.concat(stages.map(function (el) {
            return <StageListItemComponent key={el.id} stage={el}/>;
        }));

        let bonus = state.bonus;
        if (bonus) {
            result.push(<StageListItemComponent key={bonus.id} stage={bonus}/>);
        } else {
            console.log('No Bonus');
        }

        let killer = state.killer;
        if (killer) {
            result.push(<StageListItemComponent key={killer.id} stage={killer}/>);

            if (killer.status == StageStatus.KILLER_COMPLETED) {
                result.push(<KillerResultListItemComponent key='killer_result'/>);
            }

        } else {
            console.log('No killer');
        }

        return <div className="row">
            <div className="col-lg-12">
                <h1>{auth.getName()}</h1>
                {result}
            </div>
        </div>;
    }
}
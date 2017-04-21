import * as React from 'react';
import {appStateService} from '../../state/AppStateService';
import {AbstractStageListItemComponent} from './AbstractStageListItemComponent';

const Link = require('react-router/lib/Link');


export class StageListItemComponent extends AbstractStageListItemComponent<{ stage: Stage }, any> {
    constructor(props: { stage: Stage }, context: any) {
        super(props, context);
    }

    getLink() {
        const stage = this.props.stage;
        const id = stage.id;
        return 'stage/' + id;
    }

    getName() {
        const stage = this.props.stage;

        return appStateService.getStageName(stage);
    }


    getStatus(): StageStatus {
        const stage = this.props.stage;
        return stage.status;
    }
}
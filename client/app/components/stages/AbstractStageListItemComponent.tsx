import {StageListItemStatusComponent} from './StageListItemStatusComponent';
import * as React from 'react';

const Link = require('react-router/lib/Link');

export abstract class AbstractStageListItemComponent<T, Q> extends React.Component<T, Q> {

    constructor(props: T, context: any) {
        super(props, context);
    }

    render() {
        const stageLink = this.getLink();

        return <div className="row">
            <div className="col-xs-12 col-md-8">
                <h4><Link to={stageLink}>{this.getName()}</Link></h4>

            </div>

            <div className="col-xs-6 col-md-4">
                <StageListItemStatusComponent stage={this.getStage()} stageStatus={this.getStatus()}/>
            </div>
        </div>;
    }

    abstract getLink(): string;

    abstract getName(): string;

    getStage(): Stage | null {
        return null;
    }

    abstract getStatus(): StageStatus;
}
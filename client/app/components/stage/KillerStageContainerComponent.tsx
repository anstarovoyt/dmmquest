import {StageContainerComponent} from "./StageContainerComponent";
import {KillerStageComponent} from "./KillerStageComponent";
import * as React from "react";

export class KillerStageContainerComponent extends StageContainerComponent {
    getStageId() {
        return "killer";
    }

    createStageComponent(stage: Stage) {
        return <KillerStageComponent stage={stage}/>;
    }
}
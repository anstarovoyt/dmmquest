import {AbstractStageListItemComponent} from "./AbstractStageListItemComponent";
export class KillerResultListItemComponent extends AbstractStageListItemComponent<any, any> {

    getLink(): string {
        return "killer_result";
    }

    getName(): string {
        return "Концовочка";
    }

    getStatus(): StageStatus {
        return StageStatus.KILLER;
    }
}
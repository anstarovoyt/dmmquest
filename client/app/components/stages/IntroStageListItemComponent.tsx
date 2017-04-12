import {AbstractStageListItemComponent} from "./AbstractStageListItemComponent";
export class IntroStageListItemComponent extends AbstractStageListItemComponent<any, any> {

    getLink(): string {
        return "intro";
    }

    getName(): string {
        return "Intro";
    }

    getStatus(): StageStatus {
        return StageStatus.INTO;
    }
}
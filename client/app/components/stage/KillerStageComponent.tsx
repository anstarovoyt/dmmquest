import {StageComponent} from "./StageComponent";

export class KillerStageComponent extends StageComponent {

    saveAnswers(): any {
        let stage = this.props.stage;
        if (!stage) {
            return;
        }


        if (!window.confirm('Вы действительно хотите проверить свою догадку? У вас больше не будет попыток')) {
            return;
        }


    }
}
import {auth} from "../authentication/AuthService";
import {loadQuestions} from "../communitation/Dispatcher";
import {appStateService} from "./AppStateService";

class QuestService {

    questTexts: {
        [id: string]: QuestTexts
    } = {};

    reset(stageId: string) {
        delete this.questTexts[stageId];
    }

    getAsyncQuestTexts(stage: Stage, result: ProcessQuestTexts) {
        var questText: QuestTexts = this.questTexts[stage.id];
        if (questText != null) {
            result({success: true, texts: questText});
            return;
        }

        var token = auth.getToken();
        var toSend: QuestTextsRequest = {token, stageId: stage.id};
        var self = this;

        var successCallback = (res: QuestTextsResponse) => {
            var success = res != null && res.success;
            if (success && stage.id != 'bonus') {
                self.questTexts[stage.id] = res.questTexts;
            }

            result({success: success, texts: res.questTexts});
        }

        loadQuestions(toSend, successCallback);
    }
}

export var questService: QuestService = new QuestService();




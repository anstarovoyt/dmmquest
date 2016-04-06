import {auth} from "../authentication/AuthService";
import {loadQuestions} from "../communitation/Dispatcher";

class QuestService {
    
    questTexts:{
        [id:string]:QuestTexts
    } = {};

    getAsyncQuestTexts(stage:Stage, result:ProcessQuestTexts) {
        var questText:QuestTexts = this.questTexts[stage.id];
        if (questText != null) {
            result(questText);
            return;
        }

        var token = auth.getToken();
        var toSend:QuestTextsRequest = {token, stageId: stage.id};
        var self = this;

        var successCallback = (res:QuestTextsResponse) => {
            if (res != null && res.success) {
                console.log(stage);
                self.questTexts[stage.id] = res.questTexts;
            }

            result(res.questTexts);
        }

        loadQuestions(toSend, successCallback);
    }
}

export var questService:QuestService = new QuestService();



import auth from '../authentication/AuthService'

var reqwest: Reqwest.ReqwestStatic = require('reqwest');


class QuestService {
	questTexts: {
		[id: string]: QuestTexts
	} = {};

	getAsyncQuestTexts(stage: Stage, result: ProcessQuestTexts) {
		var questText: QuestTexts = this.questTexts[stage.id];
		if (questText != null) {
			result(questText);
			return;
		}

		var token = auth.getToken();
		var toSend: RequestQuestTexts = {token, stageId: stage.id};
		var self = this;
		reqwest({
			url: '/quest-texts',
			method: 'post',
			data: toSend,
			success(res: ResponseQuestTexts) {
				if (res != null && res.success) {
					console.log(stage);
					self.questTexts[stage.id] = res.questTexts;
				}
				
				result(res.questTexts);
			}
		})
	}
}

export var questService: QuestService = new QuestService();



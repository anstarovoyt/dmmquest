var reqwest:Reqwest.ReqwestStatic = require('reqwest');

export function loadQuestions(toSend:QuestTextsRequest, successCallback:(res:QuestTextsResponse)=>void) {
    reqwest({
        url: '/quest-texts',
        method: 'post',
        data: toSend,
        success: successCallback
    })
}


export function authRequest(toSend:LoginRequest, callback:(info:LoginInfo) => void) {
    reqwest({
        url: '/login',
        method: 'post',
        data: toSend,
        success: callback
    });
}

export function loadState(toSend:AppStateRequest, successCallback:(res:FullAppStateResponse)=>void) {
    reqwest({
        url: '/state',
        method: 'post',
        data: toSend,
        success: successCallback
    });
}

export function saveAnswers(toSend:AnswersUpdateRequest, successCallback:(res:AnswersUpdateResponse)=>void) {
    reqwest({
        url: '/save',
        method: 'post',
        data: toSend,
        success: successCallback
    });
}


export function complete(toSend:AnswersUpdateRequest, successCallback:(res:AppState)=>void) {
    reqwest({
        url: '/complete',
        method: 'post',
        data: toSend,
        success: successCallback
    });
}

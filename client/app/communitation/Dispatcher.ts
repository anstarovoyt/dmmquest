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

export function loadState(toSend:AppStateRequest, successCallback:(res:AppStateResponse)=>void) {
    reqwest({
        url: '/state',
        method: 'post',
        data: toSend,
        success: successCallback
    });
}

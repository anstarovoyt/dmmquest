var reqwest:Reqwest.ReqwestStatic = require('reqwest');

export function loadQuestions(toSend:QuestTextsRequest, successCallback:(res:QuestTextsResponse)=>void) {
    reqwest({
        url: '/quest-texts',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    })
}


export function authRequest(toSend:LoginRequest, callback:(info:LoginInfo) => void) {
    reqwest({
        url: '/login',
        method: 'post',
        data: toSend,
        error: () => {
            callback({
                authenticated: false
            })
        },
        success: callback
    });
}

export function loadState(toSend:AppStateRequest, successCallback:(res:FullAppStateResponse)=>void) {
    reqwest({
        url: '/state',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}

export function saveAnswers(toSend:AnswersUpdateRequest, successCallback:(res:AnswersUpdateResponse)=>void) {
    reqwest({
        url: '/save',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}


export function complete(toSend:AnswersUpdateRequest, successCallback:(res:CompleteStageResponse)=>void) {
    reqwest({
        url: '/complete',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}

export function loadTeam(toSend:TeamsRequest, successCallback:(res:TeamsResponse)=>void) {
    reqwest({
        url: '/teams',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}

export function addTeam(toSend:AddTeamRequest, successCallback:(res:AddTeamResponse)=>void) {
    reqwest({
        url: '/add-team',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}

export function removeTeam(toSend:RemoveTeamRequest, successCallback:(res:RemoveTeamResponse)=>void) {
    reqwest({
        url: '/remove-team',
        method: 'post',
        error: () => {
            successCallback({
                success: false
            })
        },
        data: toSend,
        success: successCallback
    });
}

export function getRestTime(toSend:GetRestTimeRequest, successCallback:(res:GetRestTimeResponse)=>void) {
    reqwest({
        url: '/rest-time',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}

export function uploadFileToAWS(toSend:AWSSendFileRequest, successCallback:(res:AWSSendFileResponse)=>void) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", toSend.sign);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function () {
        if (xhr.status === 200) {
            successCallback({
                success: true,
                url: toSend.url
            })
        }
    };
    xhr.onerror = function (e) {
        console.log(e);
        successCallback({
            success: false
        })
    };
    xhr.send(toSend.file);
}

export function getAWSSign(toSend:GetAWSSignRequest, successCallback:(res:GetAWSSignResponse)=>void) {
    reqwest({
        url: '/sign_s3',
        method: 'post',
        data: toSend,
        error: () => {
            successCallback({
                success: false
            })
        },
        success: successCallback
    });
}
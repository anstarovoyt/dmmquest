interface Storage {
    auth: {
        authToken:string,
        name:string
    }
}

interface LoginInfo {
    authenticated:boolean;
    name?:string;
    token?:string;
}


interface LoginRequest {
    secretCode:string
}
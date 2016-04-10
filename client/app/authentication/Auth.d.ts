interface Storage {
    authToken: string
    authName: string
}

interface LoginInfo {
    authenticated:boolean;
    name?:string;
    token?:string;
}


interface LoginRequest {
    secretCode:string
}
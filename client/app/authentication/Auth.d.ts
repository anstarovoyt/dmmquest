interface Storage {
    authToken: string
    authName: string
    admin: boolean
}

interface LoginInfo {
    authenticated:boolean;
    name?:string;
    token?:string;
    admin?:boolean
}


interface LoginRequest {
    secretCode:string
}
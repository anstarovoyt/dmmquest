interface Storage {
	authToken;
}

interface LoginInfo {
	authenticated: boolean;
	token?: string;
}


interface LoginRequest {
	secretCode:string
}
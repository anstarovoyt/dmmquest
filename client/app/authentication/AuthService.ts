import {authStore} from './AuthStore';
import {authRequest} from "../communitation/Dispatcher";

var auth = new class {
    login(secretCode:string):void {
        var token = this.getToken();
        if (token) {
            this.onChange({
                authenticated:true,
                token:token
            });
            return
        }
        
        authRequest({secretCode}, (resp) => {
            if (resp.authenticated) {
                this.storeLoginInfo(resp);
                this.onChange(resp);
            } else {
                this.onChange(resp);
            }
        });
    }

    getToken():string {
        return localStorage.authToken
    }

    logout():void {
        this.dropLoginInfo();
        
        this.onChange({
            authenticated: false,
            token: null
        })
    };

    loggedIn():boolean {
        return !!localStorage.authToken
    };

    private onChange(result:LoginInfo) {
        authStore.emitChange(result);
    };

    private storeLoginInfo(result) {
        localStorage.authToken = result.token;
    }
    
    private dropLoginInfo() {
        delete localStorage.authToken;
    }
};


export  {auth}
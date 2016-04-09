import {authStore} from "./AuthStore";
import {authRequest} from "../communitation/Dispatcher";

var auth = new class {
    login(secretCode:string, callback:(result:boolean) => void):void {
        var token = this.getToken();
        if (token) {
            this.onChange({
                authenticated: true,
                token: token
            });
            return
        }

        authRequest({secretCode}, (resp:LoginInfo) => {
            callback(resp.authenticated);
            
            if (resp.authenticated) {
                this.storeLoginInfo(resp);
                this.onChange(resp);
            } else {
                
                this.onChange(resp);
            }
        });
    }

    getToken():string {
        var data = localStorage.auth;
        return data == null ? null : data.authToken
    }

    getName():string {
        var data = localStorage.auth;
        return data == null ? null : data.name
    }

    logout():void {
        this.dropLoginInfo();

        this.onChange({
            authenticated: false,
            token: null
        })
    };

    loggedIn():boolean {
        return !!localStorage.auth
    };

    logginInfo():LoginInfo {
        var authFromStore = localStorage.auth;
        if (!authFromStore) {
            return null;
        }

        return {
            authenticated: true,
            name: authFromStore.name,
            token: authFromStore.authToken
        }
    }

    private onChange(result:LoginInfo) {
        authStore.emitChange(result);
    };

    private storeLoginInfo(result) {
        localStorage.auth = {
            authToken: result.token,
            name: result.name
        }
    }

    private dropLoginInfo() {
        delete localStorage.auth;
    }
}


export {auth}
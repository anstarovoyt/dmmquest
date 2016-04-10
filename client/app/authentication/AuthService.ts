import {authStore} from "./AuthStore";
import {authRequest} from "../communitation/Dispatcher";
import {questService} from "../state/QuestService";
import {appStateService} from "../state/AppStateService";

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
        return localStorage.authToken;
    }

    getName():string {
        return localStorage.authName;
    }

    isAdmin() {
        return localStorage.admin;
    }

    logout():void {
        this.dropLoginInfo();
        appStateService.clean();

        this.onChange({
            authenticated: false,
            token: null
        })
    };

    loggedIn():boolean {
        return !!localStorage.authToken
    };

    logginInfo():LoginInfo {
        var authFromStore = localStorage.authToken;
        if (!authFromStore) {
            return null;
        }

        return {
            authenticated: true,
            name: localStorage.authName,
            token: localStorage.authToken,
            admin: localStorage.admin
        }
    }

    private onChange(result:LoginInfo) {
        authStore.emitChange(result);
    };

    private storeLoginInfo(result:LoginInfo) {
        console.log('store ' + JSON.stringify(result));
        localStorage.authToken = result.token;
        localStorage.authName = result.name;
        if (result.admin) {
            localStorage.admin = true;
        }
    }

    private dropLoginInfo() {
        delete localStorage.authToken;
        delete localStorage.authName;
        delete localStorage.admin;
    }
}


export {auth}
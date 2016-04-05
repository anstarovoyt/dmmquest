import authStore from './AuthStore';

var auth = new class {
	login(secretCode: string): void {
		if (localStorage.authToken) {
			this.onChange(true);
			return
		}
		authRequest(secretCode, (result) => {
			if (result.authenticated) {
				localStorage.authToken = result.token;
				this.onChange(true);
			} else {
				this.onChange(false);
			}
		})
	}

	getToken(): string {
		return localStorage.authToken
	}

	logout(callback?: () => void): void {
		delete localStorage.authToken;
		if (callback) callback();
		this.onChange(false)
	};

	loggedIn(): boolean {
		return !!localStorage.authToken
	};

	onChange(p: boolean) {
		authStore.emitChange();
	};
};

function authRequest(secretCode: string, callback: (info: LoginInfo) => void) {
	//todo real impl
	setTimeout(() => {
		if (secretCode == 'secretCode') {
			callback({
				authenticated: true,
				token: Math.random().toString(36).substring(7)
			})
		} else {
			callback({authenticated: false})
		}
	}, 0);
}

export default auth;
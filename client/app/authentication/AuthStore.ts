import {EventEmitter} from "events";

class AuthStore extends EventEmitter {

	constructor() {
		super();
	}

	emitChange(newState:LoginInfo) {
		this.emit('CHANGE', newState);
	}

	addChangeListener(callback: (p:LoginInfo)=>void) {
		this.on('CHANGE', callback);
	}

	removeChangeListener(cb: (p:LoginInfo) => void) {
		this.removeListener('CHANGE', cb);
	}
}

var authStore = new AuthStore();

export {authStore}


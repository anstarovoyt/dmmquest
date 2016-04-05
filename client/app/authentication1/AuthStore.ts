import {EventEmitter} from "events";

class AuthStore extends EventEmitter {

	constructor() {
		super();
	}

	emitChange() {
		this.emit('CHANGE');
	}

	addChangeListener(callback: ()=>void) {
		this.on('CHANGE', callback);
	}

	removeChangeListener(cb: () => void) {
		console.log('remove listener');
		this.removeListener('CHANGE', cb);
	}
}

export default new AuthStore()


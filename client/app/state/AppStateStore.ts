import {EventEmitter} from "events";

class AppStateStore extends EventEmitter {

    constructor() {
        super();
    }

    emitChange(newState:AppState) {
        this.emit('CHANGE', newState);
    }

    addChangeListener(callback: (p:AppState)=>void) {
        this.on('CHANGE', callback);
    }

    removeChangeListener(cb: (p:AppState) => void) {
        this.removeListener('CHANGE', cb);
    }
}
var appStateStore = new AppStateStore();

export {appStateStore}

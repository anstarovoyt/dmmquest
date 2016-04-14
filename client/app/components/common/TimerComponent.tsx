import * as React from "react";
import {getRestTime} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";

export class TimerComponent extends React.Component<any, {rest:number, isCompleted:boolean}> {


    private updateTimer = 0;
    private interval = null;

    constructor(props:any, context:any) {
        super(props, context);

        this.state = {
            rest: -1,
            isCompleted: false
        }
    }


    componentWillUnmount():void {
        if (this.interval != null) {
            clearInterval(this.interval);
        }
    }

    componentDidMount() {
        this.syncTimeWithServer();
    }

    private syncTimeWithServer() {
        getRestTime({
            token: auth.getToken()
        }, (res) => {
            console.log('Sync time with server');
            if (res.success) {

                var value:any = res.restTimeInSeconds ? res.restTimeInSeconds : -1;

                var rest = Number(value);
                this.setState({
                    rest: rest,
                    isCompleted: res.isCompleted,
                });

                if (!res.isCompleted && rest > 0) {
                    this.updateTimer = 60;
                    this.updateTimeTrigger();
                }
            }
        })
    }


    render() {
        if (this.state.isCompleted) {
            return <div className="col-md-4 timer"><p>Время вышло</p></div>
        }


        if (this.state.rest == -1) {
            return <div className="col-md-4 timer"></div>
        }


        return (
            <div className="col-md-4 timer"><p>Осталось: {this.getTime()}</p></div>
        )
    }

    getTime() {
        return secondsToString(this.state.rest);
    }

    updateTimeTrigger() {
        this.interval = setInterval(() => {
            this.updateTimer--;

            var currentValue = this.state.rest;
            var completed = this.state.isCompleted;
            if (!currentValue || currentValue < 0 || completed || this.updateTimer <= 0) {
                if (this.interval != null) {
                    clearInterval(this.interval);
                }
                if (!completed) {
                    this.syncTimeWithServer();
                }
                return;
            }

            var nextValue = currentValue - 1;


            this.setState({
                rest: nextValue,
                isCompleted: false
            })
        }, 1000);
    }

}

function secondsToString(sec_num:number) {
    var hours:any = Math.floor(sec_num / 3600);
    var minutes:any = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds:any = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}
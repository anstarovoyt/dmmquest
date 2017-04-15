import * as React from "react";
import {appStateService} from "../../state/AppStateService";
import {StageContainerComponent} from "./StageContainerComponent";
import {LoadingComponent} from "../common/LoadingComponent";
import {getResult} from "../../communitation/Dispatcher";
import {auth} from "../../authentication/AuthService";

var Link = require('react-router/lib/Link');


export class KillerResultComponent extends React.Component<any, { resultText?: string, error?: boolean }> {


    constructor(props: any, context: any) {
        super(props, context);

        this.state = {}
    }

    componentDidMount() {
        getResult({token: auth.getToken()}, (result => {
            this.setState({
                resultText: result.description,
                error: result.error
            });
        }));
    }

    render() {
        let link = this.state.resultText;
        if (!link) {
            return <LoadingComponent/>;
        }

        if (this.state.error) {
            return <span>Ошибка загрузки данных. Попробуйте обновить страницу</span>;
        }

        return <div className="row">
            <div className="col-lg-12">
                <h1><Link to="/">
                    <span className="glyphicon glyphicon-arrow-left"></span>
                </Link>
                    Result
                </h1>
                <div className="row">
                    <div className="col-xs-12 col-md-8">
                        <div dangerouslySetInnerHTML={{__html: link}}/>
                    </div>
                </div>
            </div>
        </div>;
    }
}
import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import MainComponent from "./components/main/MainComponent";
import {StagesListComponent} from "./components/stages/StagesListComponent";
import {StageContainerComponent} from "./components/stage/StageContainerComponent";
import {BonusStageContainerComponent} from "./components/stage/BonusStageContainer";
import {AdminComponent} from "./components/admin/AdminComponent";

//hack to reduce size
var Router = require('react-router/lib/Router');
var Route = require('react-router/lib/Route');
var IndexRoute = require('react-router/lib/IndexRoute');
var useRouterHistory:any = require('react-router/lib/useRouterHistory');
var createHashHistory = require("history/lib/createHashHistory");


const appHistory = useRouterHistory(createHashHistory)({queryKey: false});

renderRouter();

function renderRouter() {
    ReactDOM.render((
        <Router history={appHistory}>
            <Route path="/" component={MainComponent}>
                <IndexRoute component={StagesListComponent}/>
                <Route path="/stages" component={StagesListComponent}/>
                <Route path="/stage/:id" component={StageContainerComponent}/>
                <Route path="/bonus" component={BonusStageContainerComponent}/>
                <Route path="/admin" component={AdminComponent}/>
            </Route>
        </Router>
    ), document.getElementById('content'));
}
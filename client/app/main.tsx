import "bootstrap/dist/css/bootstrap.min.css";
import "./main.css";
import * as React from "react";
import * as ReactDOM from "react-dom";

//hack to reduce size
var Router = require('react-router/lib/Router');
var Route = require('react-router/lib/Route');
var IndexRoute = require('react-router/lib/IndexRoute');
var useRouterHistory:any = require('react-router/lib/useRouterHistory');

import MainComponent from "./components/main/MainComponent";
import {StagesListComponent} from "./components/stages/StagesListComponent";
import {createHashHistory} from "history";
import {StageContainerComponent} from "./components/stage/StageContainerComponent";


const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

renderRouter();

function renderRouter() {
	ReactDOM.render((
		<Router history={appHistory}>
			<Route path="/" component={MainComponent}>
				<IndexRoute component={StagesListComponent}/>
				<Route path="/stages" component={StagesListComponent}/>
				<Route path="/stage/:id" component={StageContainerComponent}/>
			</Route>
		</Router>
	), document.getElementById('content'));
}
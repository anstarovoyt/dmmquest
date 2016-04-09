import "bootstrap/dist/css/bootstrap.min.css";
// import "font-awesome/css/font-awesome.css";
import "./main.css";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {Router, Route, IndexRoute, useRouterHistory} from "react-router";
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
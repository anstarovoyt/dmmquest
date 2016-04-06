import "bootswatch/paper/bootstrap.css"
import "font-awesome/css/font-awesome.css"
import "./main.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import {Router, Route, IndexRoute, useRouterHistory} from "react-router"
import MainComponent from "./components/main/MainComponent"
import StagesComponent from "./components/stages/StagesComponent"
import {createHashHistory} from "history"
import {StageComponent} from "./components/stage/StageComponent";


const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

renderRouter();

function renderRouter() {
	ReactDOM.render((
		<Router history={appHistory}>
			<Route path="/" component={MainComponent}>
				<IndexRoute component={StagesComponent}/>
				<Route path="/stages" component={StagesComponent}/>
				<Route path="/stage/:id" component={StageComponent}/>
			</Route>
		</Router>
	), document.getElementById('content'));
}
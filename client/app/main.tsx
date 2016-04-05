import "bootswatch/paper/bootstrap.css"
import "font-awesome/css/font-awesome.css"
import "./main.css"
import * as React from "react"
import * as ReactDOM from "react-dom"
import {Router, Route, IndexRoute, useRouterHistory} from "react-router"
import MainComponent from "./Components/Main/MainComponent"
import StagesComponent from "./Components/Stages/StagesComponent"
import {createHashHistory} from "history"


const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

renderRouter();

function renderRouter() {
	ReactDOM.render((
		<Router history={appHistory}>
			<Route path="/" component={MainComponent}>
				<IndexRoute component={StagesComponent}/>
				<Route path="/stages" component={StagesComponent}/>
			</Route>
		</Router>
	), document.getElementById('content'));
}
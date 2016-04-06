import * as React from "react"
import {Link} from "react-router"
import Placeholder from "./MainNestedComponentPlaceholder"

export default class MainComponent extends React.Component<{ children: any }, {}> {

	render() {
		return (
			<div>
				<nav className="navbar navbar-inverse navbar-fixed-top">
					<div className="container">
						<div className="navbar-header">
							<Link className="navbar-brand" to="/">Квест ДММ</Link>
						</div>

						<ul className="nav navbar-nav">
						</ul>
					</div>
				</nav>
				<div className="container">
					<Placeholder children={this.props.children} />
				</div>
				<footer className="footer">
					me
				</footer>
			</div>
		);
	}

}
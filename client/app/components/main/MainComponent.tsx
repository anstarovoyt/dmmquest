import * as React from "react";
import Placeholder from "./MainNestedComponentPlaceholder";

export default class MainComponent extends React.Component<{ children:any }, {}> {

    render() {
        return (
                <Placeholder children={this.props.children}/>             
        );
    }

}
import * as React from "react";
import Placeholder from "./MainNestedComponentPlaceholder";
import {FooterComponent} from "../common/FooterComponent";

export default class MainComponent extends React.Component<{ children:any }, {}> {

    render() {
        return (
                <Placeholder children={this.props.children}/>             
        );
    }

}
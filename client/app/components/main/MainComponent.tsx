import * as React from "react";
import Placeholder from "./MainNestedComponentPlaceholder";
import {FooterComponent} from "../common/FooterComponent";

export default class MainComponent extends React.Component<{ children:any }, {}> {

    render() {
        return (
            <div className="site-wrapper">
                <div className="site-wrapper-inner">
                    <div className="cover-container">
                        <Placeholder children={this.props.children}/>

                        <FooterComponent />
                    </div>
                </div>
            </div>


        );
    }

}
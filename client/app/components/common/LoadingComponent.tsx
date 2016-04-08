import * as React from "react"

export class LoadingComponent extends React.Component<any, any> {

    render() {

        return <div className="progress progress-striped active">
            <div className="progress-bar"
                 role="progressbar"
                 aria-valuenow="100"
                 style={{width: "100%",
                        opacity:0.3
                 }}>
                <span className="sr-only">Loading</span>
            </div>
        </div>
    }
}
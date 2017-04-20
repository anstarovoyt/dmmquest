import * as React from 'react';


type Props = {
    isDisabled?: boolean,
    uploadFile: () => void,
    buttonMessage: string,
    hasBackground: boolean,
    value: string
};

export class FileUploadControl extends React.Component<Props, any> {


    constructor(props: Props, context: any) {
        super(props, context);
    }

    render() {
        let isCompleted = this.props.isDisabled;
        let buttonMessage = this.props.buttonMessage;
        let value = this.props.value;
        const iconSpan = this.props.hasBackground ? FileUploadControl.getAnimatedIconSpan() : FileUploadControl.getUploadIconSpan();
        return <div className="input-group">
            <input type="text"
                   disabled={true}
                   value={value}
                   className="form-control"
                   placeholder="Загрузите файл"/>
            <span className="input-group-btn">
                                <label disabled={isCompleted} className="btn btn-info">
                              <input
                                  type="file"
                                  disabled={isCompleted}
                                  onChange={this.props.uploadFile}>
                                  {iconSpan}&nbsp;{buttonMessage}{this.props.children}</input>
                                </label>
                            </span>
        </div>;
    }

    private static getUploadIconSpan() {
        //noinspection CheckTagEmptyBody
        return <span className="glyphicon glyphicon-floppy-open"></span>;
    }

    private static getAnimatedIconSpan() {
        //noinspection CheckTagEmptyBody
        return <span className="glyphicon glyphicon-refresh"></span>;
    }
}
import * as React from 'react';
import {auth} from '../../../authentication/AuthService';
import {getAWSSign, saveAnswers, uploadFileToAWS} from '../../../communitation/Dispatcher';


type Props = {
    isDisabled?: boolean,
    fileUploadResult(success: boolean, newValue?: string, restoreState?: () => void): void,
    stageId: string,
    questId: number,
    value: string
};

export class FileUploadControl extends React.Component<Props, { hasBackground: boolean }> {


    constructor(props: Props, context: any) {
        super(props, context);

        this.state = {hasBackground: false};
    }

    render() {
        let isCompleted = this.props.isDisabled;
        let buttonMessage = this.state.hasBackground ? 'Загрузка...' : 'Загрузить';
        let split = this.props.value ? this.props.value.split('\n') : [];
        let value = this.props.value ? `Файлов: ${split.length}` : 'Нет файлов';
        const iconSpan = this.state.hasBackground ? FileUploadControl.getAnimatedIconSpan() : FileUploadControl.getUploadIconSpan();

        return <div>
            <div className="input-group">
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
                                  onChange={this.uploadFile.bind(this)}>
                                  {iconSpan}&nbsp;{buttonMessage}{this.props.children}</input>
                                </label>
                            </span>
            </div>
            <div className="input-group">
                {split.map((el, i) => {
                    return <a key={i} href={el}>File {i + 1}</a>;
                })}

            </div>
        </div>;
    }

    uploadFile(e) {
        e.preventDefault();
        const target = e.target;
        const files = target.files;
        const file = files[0];
        if (file == null) {
            return;
        }

        this.setState({
            hasBackground: true
        });

        getAWSSign({
            token: auth.getToken(),
            fileName: file.name,
            type: 'answer',
            fileType: file.type,
            stageId: this.props.stageId,
            questId: this.props.questId
        }, (res) => {
            if (!res.success) {
                this.props.fileUploadResult(false);
                this.setState({
                    hasBackground: false
                });

                return;
            }

            uploadFileToAWS({
                file: file,
                sign: res.sign,
                url: res.url
            }, (res) => {
                target.value = '';
                this.props.fileUploadResult(res.success,
                    res.success ? getUpdatedValue(this.props.value, res.url) : null,
                    () => {
                        this.setState({
                            hasBackground: false
                        });
                    });
            });
        });
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

function getUpdatedValue(value: string, newUrl: string) {
    if (!value) {
        return newUrl;
    }

    return value + '\n' + newUrl;
}
import * as React from 'react';
import {auth} from '../../../authentication/AuthService';
import {getAWSSign, uploadFileToAWS} from '../../../communitation/Dispatcher';
import {AnswerControl, Props} from './AnswerControl';


export class FileUploadControl extends AnswerControl {


    constructor(props: Props, context: any) {
        super(props, context);

        this.state = {
            hasBackground: false,
            savedMark: ActionState.NO,
            value: this.props.value
        };
    }

    getTextForPopup() {
        let savedMark = this.state.savedMark;
        if (savedMark == ActionState.SAVED) return 'Файл загружен';
        if (savedMark == ActionState.ERROR) return 'Ошибка при отправке';

        return '';
    }

    render() {
        let isCompleted = this.props.isDisabled;
        let buttonMessage = this.state.hasBackground ? 'Загрузка...' : 'Загрузить';
        let split = this.state.value ? this.state.value.split('\n') : [];
        let value = this.state.value ? `Файлов: ${split.length}` : 'Нет файлов';
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
                                        disabled={isCompleted || this.state.hasBackground}
                                        onChange={this.uploadFile.bind(this)}>
                                        {iconSpan}&nbsp;
                                        {buttonMessage}
                                        {this.getPopupSpan()}
                                  </input>
                                </label>
                            </span>
            </div>
            <div className="input-group">
                {split.map((el, i) => {
                    return <a key={i} href={el}>{this.props.typeText} {i + 1}</a>;
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
            value: this.state.value,
            hasBackground: true,
            savedMark: ActionState.NO
        });

        getAWSSign({
            token: auth.getToken(),
            fileName: file.name,
            type: this.props.typeText,
            fileType: file.type,
            stageId: this.props.stageId,
            questId: this.props.questId
        }, (res) => {
            if (!res.success) {
                this.setState({
                    value: this.state.value,
                    hasBackground: false,
                    savedMark: ActionState.ERROR
                });
                this.setTimeoutToResetMarks();
                return;
            }

            uploadFileToAWS({
                file: file,
                sign: res.sign,
                url: res.url
            }, (res) => {
                target.value = '';
                let success = res.success;
                if (!success) {
                    this.setState({
                        value: this.state.value,
                        hasBackground: false,
                        savedMark: ActionState.ERROR
                    });
                    this.setTimeoutToResetMarks();
                    return;
                }

                let updatedValue = getUpdatedValue(this.state.value, res.url);
                this.props.saveValue(updatedValue, (requestSuccess) => {

                    this.setState({
                        value: requestSuccess ? updatedValue : this.state.value,
                        hasBackground: false,
                        savedMark: requestSuccess ? ActionState.SAVED : ActionState.ERROR
                    });

                    this.setTimeoutToResetMarks();
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
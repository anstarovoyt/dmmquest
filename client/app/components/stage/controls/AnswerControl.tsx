import * as React from 'react';

export type Props = {
    isDisabled?: boolean,
    saveValue(newValue: string, restoreState: (success: boolean) => void): void,
    stageId: string,
    questId: number,
    value: string
};


export class AnswerControl extends React.Component<Props, {
    hasBackground: boolean,
    savedMark: ActionState,
    value: string
}> {

    private timeOutMarker = null;

    componentWillUnmount(): void {
        if (this.timeOutMarker != null) {
            clearTimeout(this.timeOutMarker);
            this.timeOutMarker = null;
        }
    }

    setTimeoutToResetMarks() {
        if (this.timeOutMarker) {
            clearTimeout(this.timeOutMarker);
        }
        this.timeOutMarker = setTimeout(() => {
            this.setState({
                hasBackground: false,
                savedMark: ActionState.NO,
                value: this.state.value
            });

            this.timeOutMarker = null;
        }, 3000);
    }

    getTextForPopup(): string {
        let savedMark = this.state.savedMark;
        if (savedMark == ActionState.SAVED) return 'Ответы сохранены';
        if (savedMark == ActionState.ERROR) return 'Ошибка при отправке';

        return '';
    }

    getPopupSpan() {
        return <span className={this.getSavedClass()}> {this.getTextForPopup()} </span>;
    }

    getSavedClass() {
        let savedMark = this.state.savedMark;
        return 'done-mark' + (savedMark == ActionState.ERROR || savedMark == ActionState.SAVED ? ' view' : '');
    }

}
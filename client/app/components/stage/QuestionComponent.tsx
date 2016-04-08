import * as React from "react"

export class QuestComponent extends React.Component<{quest:Quest, stage:Stage}, any> {

    render() {

        return (
            <div className="row">
                <div className="col-xs-12 col-md-8">
                    <h4>Вопрос {this.props.quest.id + 1}</h4>
                    <p>{this.props.quest.text}</p>
                    <p className="lead"></p>
                    <div className="input-group">
                        <input type="text"
                               className="form-control"
                               placeholder="Ваш ответ"
                               defaultValue={this.getDefaultValue()}/>
                            
                            <span className="input-group-btn">
                              <button className="btn btn-info" type="button">
                                  <span className="glyphicon glyphicon-floppy-save"></span> Сохранить</button>
                            </span>
                    </div>
                </div>
            </div>)
    }

    private getDefaultValue() {
        var props = this.props;
        var answers = props.stage.questAnswers;

        return answers ? answers[props.quest.id] : "";
    }
}
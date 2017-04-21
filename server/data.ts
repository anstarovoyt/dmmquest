import {getVideo} from "./stages/helper";

export type QuestText = (string | { type: QuestType; text: string, values?: string[], answer?: string[] });

export interface RawStage {
    name: string,
    internalName?: string,
    quests: QuestText[]
    status?: StageStatus
    bonuses?: QuestText[]
    description?: string;
}


let allStages: RawStage[] = null;
let killer: RawStage = null;
let bonus: RawStage = null;
try {
    allStages = [
        require('./stages/stage_0').stage,
        require('./stages/stage_1').stage,
        require('./stages/stage_2').stage];

    killer = require('./stages/killer').stage;
    bonus = require('./stages/bonus').stage;
} catch (e) {
}

function getDefaultData(): { stages: RawStage[], bonus: RawStage, killer: RawStage } {
    if (allStages) {
        return {
            stages: allStages,
            killer,
            bonus
        };
    }

    return {
        stages: [
            {
                name: "О полевых растениях",
                quests: [
                    "Это зеленое и растет на грядке в огороде у дедушки федора.",
                    "Это синее и не растет на грядке в огороде у дедушки федора.",
                    "Этоне растет вообще нигде, но может вас убить"
                ]
            },
            {
                name: "О козлах отпущения",
                quests: [
                    "Козлы это животные. Назовите еще хоть одно животное.",
                    "Жирафы не козлы. Докажите это утверждение в трех словах",
                    "Путь самурая непрост. А каков путь козла-самурая?"
                ]
            },
            {
                name: "О программистах",
                quests: [
                    "Как вы попали в сферу разработки ПО?",
                    "Какой был ваш первый язык программирования?",
                    "Сколько примерно будет 2^32?",
                    "Как сравнить две переменные типа double или float на равенство?",
                    "Что такое класс? Что такое объект? В чем разница?",
                    "Что такое член класса? Чем он отличается от других?",
                ]
            }],
        bonus: {
            name: "О программистах",

            quests: [
                "Клонируйте овечку долли и докажите, что это ее копия",
                "Сколько попугает в жирафе? А есть он ходит по диагонали?",
                "Убейте какое-нибудь животное и пришлите фотографию"
            ]
        },
        killer: {
            name: "Убийца",

            quests: [
                "Кто",
                "Где",
                "Когда"
            ]
        },
    }
}

export const resultUnSuccess = getVideo(true, "https://www.youtube.com/embed/nntRxUD19yw") + `<br>
<h5>... Возвращайтесь через год!</h5>
`;
export const resultSuccess = getVideo(true, "https://www.youtube.com/embed/dQw4w9WgXcQ") + `<br>
<h5>Это победа, Ватсон!</h5>
`;

export const defaultData = getDefaultData();

export const intro = getVideo(true, "https://www.youtube.com/embed/ujjRcmhJh-I") + `<br>Для определения того, кто является убийцей, вам необходимо исключить из списка подозреваемых все те объекты, которые в явном и неявном виде встретятся в ответах квеста на протяжении трех этапов (в бонусах нет). Например, одна из загадок привела вас к ответу "Петя", исключаем его из списка подозреваемых. Другой пример: ответ на загадку — земноводное, вычеркиваем из списка лягушку. В конце, при всех правильно решенных загадках, у вас должно остаться по одному человеку, месту, орудию. Не все загадки позволяют вычеркивать объекты.`;
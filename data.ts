interface RawStage {
    name:string,
    quests:(string|{type:QuestType, text:string})[]
    status?:StageStatus
}

declare var all_text:{stages:RawStage[],bonus:RawStage};

function getDefaultData():{stages:RawStage[],bonus:RawStage} {
    // if (all_text) {
    //     return all_text;
    // }

    return {
        stages: [
            {
                name: "Этап один. О полевых растениях",
                quests: [
                    "Это зеленое и растет на грядке в огроде у дедушки федора.",
                    "Это синее и не растет на грядке в огроде у дедушки федора.",
                    "Этоне растет вообще нигде, но может вас убить"
                ]
            },
            {
                name: "Этап два. О козлах отпущения",
                quests: [
                    "Козлы это животные. Назовите еще хоть одно животное.",
                    "Жирафы не козлы. Докажите это утверждение в трех словах",
                    "Путь самурая непрост. А каков путь козла-самурая?"
                ]
            },
            {
                name: "Этап три. О программистах",
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
            name: "Этап бонус. О программистах",

            quests: [
                "Клонируйте овечку долли и докажите, что это ее копия",
                "Сколько попугает в жирафе? А есть он ходит по диагонали?",
                "Убейте какое-нибудь животное и пришлите фотографию"
            ]
        }
    }
}

var defaultData = getDefaultData();
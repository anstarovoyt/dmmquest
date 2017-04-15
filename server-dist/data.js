"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var helper_1 = require("./stages/helper");
var allStages = null;
var killer = null;
var bonus = null;
try {
    allStages = [
        require('./stages/stage_0').stage,
        require('./stages/stage_1').stage,
        require('./stages/stage_2').stage
    ];
    killer = require('./stages/killer').stage;
    bonus = require('./stages/bonus').stage;
}
catch (e) {
}
function getDefaultData() {
    if (allStages) {
        return {
            stages: allStages,
            killer: killer,
            bonus: bonus
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
            }
        ],
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
    };
}
exports.defaultData = getDefaultData();
exports.intro = helper_1.getVideo(true, "https://www.youtube.com/embed/ujjRcmhJh-I") + "<br>\u0414\u043B\u044F \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0438\u044F \u0442\u043E\u0433\u043E, \u043A\u0442\u043E \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0443\u0431\u0438\u0439\u0446\u0435\u0439, \u0432\u0430\u043C \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0438\u0441\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0435\u0432\u0430\u0435\u043C\u044B\u0445 \u0432\u0441\u0435 \u0442\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0432 \u044F\u0432\u043D\u043E\u043C \u0438 \u043D\u0435\u044F\u0432\u043D\u043E\u043C \u0432\u0438\u0434\u0435 \u0432\u0441\u0442\u0440\u0435\u0442\u044F\u0442\u0441\u044F \u0432 \u043A\u0432\u0435\u0441\u0442\u0435 \u043D\u0430 \u043F\u0440\u043E\u0442\u044F\u0436\u0435\u043D\u0438\u0438 \u0442\u0440\u0435\u0445 \u044D\u0442\u0430\u043F\u043E\u0432 (\u0432 \u0431\u043E\u043D\u0443\u0441\u0430\u0445 \u043D\u0435\u0442). \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043E\u0434\u043D\u0430 \u0438\u0437 \u0437\u0430\u0433\u0430\u0434\u043E\u043A \u043F\u0440\u0438\u0432\u0435\u043B\u0430 \u0432\u0430\u0441 \u043A \u043E\u0442\u0432\u0435\u0442\u0443 \"\u041F\u0435\u0442\u044F\", \u0438\u0441\u043A\u043B\u044E\u0447\u0430\u0435\u043C \u0435\u0433\u043E \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u043F\u043E\u0434\u043E\u0437\u0440\u0435\u0432\u0430\u0435\u043C\u044B\u0445. \u0414\u0440\u0443\u0433\u043E\u0439 \u043F\u0440\u0438\u043C\u0435\u0440: \u043E\u0442\u0432\u0435\u0442 \u043D\u0430 \u0437\u0430\u0433\u0430\u0434\u043A\u0443 \u2014 \u0437\u0435\u043C\u043D\u043E\u0432\u043E\u0434\u043D\u043E\u0435, \u0432\u044B\u0447\u0435\u0440\u043A\u0438\u0432\u0430\u0435\u043C \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430 \u043B\u044F\u0433\u0443\u0448\u043A\u0443. \u0412 \u043A\u043E\u043D\u0446\u0435, \u043F\u0440\u0438 \u0432\u0441\u0435\u0445 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u043E \u0440\u0435\u0448\u0435\u043D\u043D\u044B\u0445 \u0437\u0430\u0433\u0430\u0434\u043A\u0430\u0445, \u0443 \u0432\u0430\u0441 \u0434\u043E\u043B\u0436\u043D\u043E \u043E\u0441\u0442\u0430\u0442\u044C\u0441\u044F \u043F\u043E \u043E\u0434\u043D\u043E\u043C\u0443 \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0443, \u043C\u0435\u0441\u0442\u0443, \u043E\u0440\u0443\u0434\u0438\u044E. \u041D\u0435 \u0432\u0441\u0435 \u0437\u0430\u0433\u0430\u0434\u043A\u0438 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u044E\u0442 \u0432\u044B\u0447\u0435\u0440\u043A\u0438\u0432\u0430\u0442\u044C \u043E\u0431\u044A\u0435\u043A\u0442\u044B.";
//# sourceMappingURL=data.js.map
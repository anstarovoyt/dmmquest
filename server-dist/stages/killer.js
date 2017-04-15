"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stage = {
    status: 5 /* KILLER */,
    name: "Убийца",
    internalName: "Killer",
    quests: [
        {
            text: "Кто",
            type: 3 /* LIST_BOX */,
            values: ["Маша", "Ваня", "Настя", "Архитектор", "Есенин"],
            answer: ["Есенин"]
        },
        {
            text: "Где",
            type: 3 /* LIST_BOX */,
            values: ["Евразия", "Школа", "Фонтан", "Аэропорт", "Прачечная", "Храм", "Маяк", "УПИ"],
            answer: ["УПИ"]
        },
        {
            text: "С помощью чего",
            type: 3 /* LIST_BOX */,
            values: ["Жир", "Питон", "Телефонный аппарат", "Камень", "Молот", "Волосы", "Туалетная бумага"],
            answer: ["Туалетная бумага"]
        }
    ]
};
//# sourceMappingURL=killer.js.map
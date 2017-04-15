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
            values: ["Александрийский М.М.", "Архитектор", "Ваня", "Косой", "Маша", "Настя", "Петрович"],
            answer: ["Петрович"]
        },
        {
            text: "Где",
            type: 3 /* LIST_BOX */,
            values: ["Аэропорт", "Метро", "Перекрёсток", "Прачечная", "Фонтан", "Храм", "Школа"],
            answer: ["Перекрёсток"]
        },
        {
            text: "С помощью чего",
            type: 3 /* LIST_BOX */,
            values: ["Волосы", "Горячий жир", "Камень", "Молот", "Питон", "Собака Баскервилей", "Топор"],
            answer: ["Топор"]
        }
    ]
};
//# sourceMappingURL=killer.js.map
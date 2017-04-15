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
            values: ["Маша", "Ваня", "Настя", "Архитектор"],
            answer: ["Настя"]
        },
        {
            text: "Где",
            type: 3 /* LIST_BOX */,
            values: ["Евразия", "Школа", "Фонтан", "Парковка", "Аэропорт", "Прачечная", "Храм", "Маяк"],
            answer: ["Школа"]
        },
        {
            text: "С помощью чего",
            type: 3 /* LIST_BOX */,
            values: ["Жир", "Питон", "Телефонный аппарат", "Камень", "Молот", "Волосы"],
            answer: ["Жир"]
        }
    ]
};
//# sourceMappingURL=killer.js.map
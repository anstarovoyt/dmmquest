"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stage = {
    status: 5 /* KILLER */,
    name: 'Убийца',
    internalName: 'Killer',
    quests: [
        {
            text: 'Кто',
            type: 3 /* LIST_BOX */,
            values: ['Иван', 'Елизавета', 'Косой', 'М. Александрийский', 'Мария', 'Настасья'],
            answer: ['Елизавета']
        },
        {
            text: 'Где',
            type: 3 /* LIST_BOX */,
            values: ['Мамаев Курган', 'Прачечная', 'Инстик'],
            answer: ['Инстик']
        },
        {
            text: 'С помощью чего',
            type: 3 /* LIST_BOX */,
            values: ['Горячий жир', 'Собака Баскервилей', 'Топор'],
            answer: ['Топор']
        }
    ]
};
//# sourceMappingURL=killer.js.map
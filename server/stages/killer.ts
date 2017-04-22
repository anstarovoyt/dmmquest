import {RawStage} from '../data';

export const stage: RawStage = {
    status: StageStatus.KILLER,
    name: 'Убийца',
    internalName: 'Killer',
    quests: [
        {
            text: 'Кто',
            type: QuestType.LIST_BOX,
            values: ['Иван', 'Елизавета', 'Косой', 'М. Александрийский', 'Мария', 'Настасья'],
            answer: ['Елизавета']
        },
        {
            text: 'Где',
            type: QuestType.LIST_BOX,
            values: ['Мамаев Курган', 'Прачечная', 'Инстик'],
            answer: ['Инстик']
        },
        {
            text: 'С помощью чего',
            type: QuestType.LIST_BOX,
            values: ['Горячий жир', 'Собака Баскервилей', 'Топор'],
            answer: ['Топор']
        }
    ]
};
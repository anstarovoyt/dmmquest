import {RawStage} from "../data";

export const stage: RawStage = {
    status: StageStatus.KILLER,
    name: "Убийца",
    internalName: "Killer",
    quests: [
        {
            text: "Кто",
            type: QuestType.LIST_BOX,
            values: ["Александрийский М.М.", "Архитектор", "Ваня", "Косой", "Маша", "Настя", "Петрович"],
            answer: ["Петрович"]
        },
        {
            text: "Где",
            type: QuestType.LIST_BOX,
            values: ["Аэропорт", "Метро", "Перекрёсток", "Прачечная", "Фонтан", "Храм", "Школа"],
            answer: ["Перекрёсток"]
        },
        {
            text: "С помощью чего",
            type: QuestType.LIST_BOX,
            values: ["Волосы", "Горячий жир", "Камень", "Молот", "Питон", "Собака Баскервилей", "Топор"],
            answer: ["Топор"]
        }
    ]
}
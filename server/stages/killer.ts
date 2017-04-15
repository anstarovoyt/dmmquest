import {RawStage} from "../data";

export const stage: RawStage = {
    status: StageStatus.KILLER,
    name: "Убийца",
    internalName: "Killer",
    quests: [
        {
            text: "Кто",
            type: QuestType.LIST_BOX,
            values: ["Маша", "Ваня", "Настя", "Архитектор"],
            answer: ["Настя"]
        },
        {
            text: "Где",
            type: QuestType.LIST_BOX,
            values: ["Евразия", "Школа", "Фонтан", "Парковка", "Аэропорт", "Прачечная", "Храм", "Маяк"],
            answer: ["Школа"]
        },
        {
            text: "С помощью чего",
            type: QuestType.LIST_BOX,
            values: ["Жир", "Питон", "Телефонный аппарат", "Камень", "Молот", "Волосы"],
            answer: ["Жир"]
        }
    ]
}
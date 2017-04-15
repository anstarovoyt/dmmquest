import {RawStage} from "../data";

export const stage: RawStage = {
    status: StageStatus.KILLER,
    name: "Убийца",
    internalName: "Killer",
    quests: [
        {
            text: "Кто",
            type: QuestType.LIST_BOX,
            values: ["Маша", "Ваня", "Настя", "Архитектор", "Есенин"],
            answer: ["Есенин"]
        },
        {
            text: "Где",
            type: QuestType.LIST_BOX,
            values: ["Евразия", "Школа", "Фонтан", "Аэропорт", "Прачечная", "Храм", "Маяк", "УПИ"],
            answer: ["УПИ"]
        },
        {
            text: "С помощью чего",
            type: QuestType.LIST_BOX,
            values: ["Жир", "Питон", "Телефонный аппарат", "Камень", "Молот", "Волосы", "Туалетная бумага"],
            answer: ["Туалетная бумага"]
        }
    ]
}
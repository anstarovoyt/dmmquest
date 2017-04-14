import {RawStage} from "../data";

export const stage: RawStage = {
    status: StageStatus.KILLER,
    name: "Убийца",
    internalName: "Killer",
    quests: [
        {
            text: "Кто",
            type: QuestType.LIST_BOX,
            values: ["Маша", "Ваня"]
        },
        {
            text:"Где",
            type: QuestType.LIST_BOX,
            values: ["Евразия"]
        },
        {
            text:"С помощью чего",
            type: QuestType.LIST_BOX,
            values: ["Жир", "Питон"]
        }
    ]
}
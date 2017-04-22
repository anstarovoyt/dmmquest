import {RawStage} from '../data';

export const stage: RawStage = {
    status: StageStatus.BONUS,
    name: 'Бонусы',
    internalName: 'Бонус',
    quests: [

        {
            text: `Вы — интеграл. Возьмите его на видео по частям!
 <br><br><i>Видео запостить в телеграмм и написать об этом в поле ответа, либо загрузить на youtube и добавить в ответ ссылку на него</i>`,
            type: QuestType.TEXT,
            answer: ['Вы — интеграл']
        },

        {
            text: `Сделайте пародию на песню "Тает снег". 
            <br><br><i>Видео запостить в телеграмм и написать об этом в поле ответа, либо загрузить на youtube и добавить в ответ ссылку на него</i>`,
            type: QuestType.TEXT,
            answer: ['Пародия Тает снег']
        },
        {
            text: `Сегодня у мамы одного из организаторов квеста день рождения. Поэтому он хочет, чтобы вы записали на видео звонок на громкой связи своей маме с признаниями в любви, благодарностями и т.п. 
<br><br><i>Видео запостить в телеграмм и написать об этом в поле ответа, либо загрузить на youtube и добавить в ответ ссылку на него</i>`,
            type: QuestType.TEXT,
            answer: ['Поздравление']
        },

        {
            text: `Селфи на фоне взлетающего самолёта в Кольцово. Полбалла за каждого участника на фото!`,
            type: QuestType.UPLOAD,
            answer: ['Фото самолета']
        }
    ]
};
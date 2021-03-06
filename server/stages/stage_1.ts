import {RawStage} from '../data';
import {getVideo} from './helper';

export const stage: RawStage = {
    name: 'Модерн',
    internalName: 'Динамо',
    timeHours: 2,
    timeMinutes:30,
    description: getVideo(true, 'https://www.youtube.com/embed/cuAbItGtKgg') +
    `<br><h5>Ватсон, за нами погоня, ваша первоочередная задача — следовать указаниям <a style="text-decoration: underline;color:blue" href="http://t.me/Wwwatsonbot" />@sherloсkbot (Wwwatsonbot)</a> в телеграмме.<br> 
Добавьте его в ваш командный чат. 
Общайтесь с ним с помощью кнопок бота или отвечая 
на его сообщения при помощи <a style="text-decoration: underline;color:blue" href="https://telegram.org/blog/replies-mentions-hashtags" >Reply</a> Бонус за командность будет получен, если на всех фотографиях будет присутствовать вся команда
</h5>`,
    quests: [
        {
            text: 'Кодовое слово, полученное после погони?',
            type: QuestType.TEXT_NO_TEAM_BONUS,
            answer: ['ВеганДММ2017', 'Проверяйте бота']
        },


        {
            text: 'Безконтрольность Челябинской авиационной тропинки приведет вас в это место. Над каким материком находится поезд?',
            type: QuestType.TEXT,
            answer: ['Евразия']
        },

        {
            text: `МММ, а что если убийца — молочник? ДА, пожалуй, проверю и эту версию, НО если это НЕ так, то как минимум сузится круг подозреваемых (вам нужен тот, который ближе всего к азии); какое ограничение есть на знаке?`,
            type: QuestType.TEXT,
            answer: ['12']
        },


        {
            text: `Три года назад 36 высоких стройных гигантов, хранивших в себе то светлое, что так дорого простому русскому человеку, с треском, грохотом и пылью пали под натиском прогресса. И даже путь, соединявший их с большой землей, частично убран с глаз. Когда ты поймешь, что это за путь, пройдись вдоль него туда, где русские женщины знали, кому жить хорошо, и вскоре ты увидишь призыв ему уходить. Назовите его.`,
            type: QuestType.TEXT,
            answer: ['Жир']
        },


        {
            text: `Эта улица названа не в честь какой-то известной представительницы прекрасной половины человечества, как кажется на первый взгляд, а в честь одной из малых рек Екатеринбурга. В районе стадиона до 60-х годов находилось устье. Потом его было решено перенести дальше на 1200 метров, в район памятника известной четверки, дабы не портить вид. Найдите на улице, названной в честь реки, дом, не замкнутый с восточной стороны. Во дворе вас ждет сказка. На строении найдите, кого любит Маша Романова.`,
            type: QuestType.TEXT,
            answer: ['Ван']
        },


        {
            text: `В нашем городе есть волшебное место выбора пола ребенка для потенциальных родителей. Хоть это и не лампа Аладдина, физическое воздействие то же самое: хотите девочку — "воздействуете" на левое, мальчика — на правое. Вам нужен дом №26 по той же улице. Кому посвящено граффити с ягодами?`,
            type: QuestType.TEXT,
            answer: ['Маш']
        },


        {
            text: `Это сейчас там приличное место и располагается сетевой магазин, о котором и не все знают. А раньше, во времена сухого закона там отоваривали водочные талоны, и об этом месте знали все посетители заоперного. Прибавьте 29 к номеру дома, в котором магазин. Во дворе найдите представителей известной детской книги. На заборе граффити, где сивер?`,
            type: QuestType.TEXT,
            answer: ['Курган']
        },

    ]
};
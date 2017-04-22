import {RawStage} from '../data';
import {getVideo} from './helper';

export const stage: RawStage = {
    name: 'Классика',
    internalName: 'Уралмаш',
    description: getVideo(true, 'https://www.youtube.com/embed/oEV83TYje64'),
    quests: [
        'Код по результатам прохождения этапа.'
    ],
    bonuses: [
        {
            text: 'Насколько тепло было Коле Елизарову, когда он шёл на работу?',
            type: QuestType.TEXT,
            answer: ['30', 'тридцать']
        },

        {
            text: `Сперва может показаться, что название этого ТЦ — жаргонизм, якобы жители этого района только так и встречаются: твое место, мое время. Но если вдуматься, то на этой же улице есть еще один ТЦ, который заставляет эту пару звучать гордо и имеет непосредственное отношение к улице, на которой они оба расположены. Сфоткаться со зверушкой`,
            type: QuestType.UPLOAD,
            answer: ['Фото со зверюшкой']
        },

        {
            text: `Известно, что некоторый многочлен девятой степени принимает в точках -4, -3, -2, -1, 0, 11, 12, 13, 14, 15 значения, соответственно, -3056888, -980333, -257794, -49859, -5297, 5703, 50488, 257823, 976146, 3038217. Посчитайте его значения в точках 1, 2, 3, 4, 5, 6, 7, 8, 9, 10. В полученной последовательности сокрыто место, в которое нужно прийти. Как? Подумайте сами, выжпрограммист! Кто охраняет загаданное место?`,
            type: QuestType.TEXT,
            answer: ['Цезарь сателлит']
        }
    ]
};
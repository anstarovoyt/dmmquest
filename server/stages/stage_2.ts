import {RawStage} from '../data';
import {getVideo} from './helper';

export const stage: RawStage = {
    name: 'Постмодерн',
    internalName: 'Ботаника',
    description: getVideo(true, 'https://www.youtube.com/embed/cIWOO9nbcJU'),

    quests: [
        'Пароль: мыкоманда',

        `На здании, в котором обитают сразу 4 совы, есть вывеска, которая подскажет путешественнику место назначения. Найдите способ добраться туда быстро, ведь время квеста ограничено! 
Найдите здание 91 на Московской дороге. Нас интересует первые два белых слова на голубом фоне.`,


        `Загадано здание. Заходить на территорию не надо - там могут быть чувствительные люди. Перечислите, какие три дня недели указаны на банерной растяжке у входа?` + getVideo(true, 'https://www.youtube.com/embed/dbvk8_Fy9RM'),


        `В месте отправления посчитайте количество эмблем скрещенных молотов.` + getVideo(true, 'https://www.youtube.com/embed/me6vAVmXR_Q'),

        ` — "Ватсон, я вижу мир по-другому. Взгляните моими глазами и попробуйте понять, на что я смотрю." <br>
 Тротуар вокруг загаданного места выложен цветной плиткой. Посчитайте количество четырехугольников вокруг (с "чёрными внутренностями" тоже считать).<br>

<img style='height: auto;width: auto; max-width: 200px;max-height: 200px;' src='/statics/stages/stage_2/quad_count.png'/>
<br>
<a style="text-decoration:underline !important" href="/statics/stages/stage_2/quad_count.png">High resolution link</a>
`,


        `Вам нужно графити с обратной стороны загаданного здания. Помимо прочего у персонажа в волосах застряла табличка, которую вам надо рассмотреть. Назовите категорию помещения.` + getVideo(true, 'https://www.youtube.com/embed/bYsl0GIZmD4')
    ],


    bonuses: [
        {
            text: 'Сделайте фото в тропических джунглях всей командой. Шерлоку должно понравиться!',
            type: QuestType.UPLOAD
        },

        `Этот объект символизирует вечную дружбу и сотрудничество, но к сожалению вечность самого объекта под вопросом. Сколько скамеек окружает водное сооружение поблизости?`,


        `В загаданном месте, недалеко от сабвея, есть машина, исполняющая желания. Найдите слово с орфографической ошибкой в правилах.` + getVideo(true, 'https://www.youtube.com/embed/eKwFNXw0CGs'),


        `Совершено убийство. Круг подозреваемых ограничен до пяти человек, мы собрали всё, что знаем про них. Сначала подозрение пало на того, что ездит на троллейбусе, но потом мы поняли: нам нужен тот, кто носит спортивную шапочку. У входа на место работы убийцы посчитай количество запрещающих знаков на информационной табличке.
<br>
<br>
На улице Фучика стоят пять домов: 1, 3, 5, 7 и 9.
Воздухоплаватель ходит за покупками в Монетку. 
Производитель сгущёнки носит на голове кепку. 
Подозреваемый, который ходит за покупками в Перчик, ездит на такси. 
Ювелир ездит на машине. 
Дом, в котором ходят в Перчик, стоит сразу справа от дома, в котором ходят за покупками в Магнит. 
Тот, кто ругает власть за дороги, носит на голове лысину. 
Тот, кто ходит за покупками в Яблоко, ругает власть за коррупцию. 
Подозреваемый из центрального дома ходит пешком. 
Куратор галереи живёт в доме 1. 
Левый сосед того, кто ругает власть за грязь, носит на голове тюрбан. 
Подозреваемый в парике, ругает власть за коррупцию. 
Тот, кто ругает власть за налоги, ездит на электричке. 
Садовник не ругает власть. 
Куратор галереи живёт рядом с подозреваемым, которые ходит за покупками в Кировский. 
Производитель сгущёнки живёт слева от садовника.`,

        `Здесь найдите табличку, надпись на которой прочитать не каждый сможет, что написано в тринадцатой строке снизу?` + getVideo(true, 'https://www.youtube.com/embed/1s_bisdhgKg')
    ]
};



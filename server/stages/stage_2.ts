import {RawStage} from "../data";
import {getVideo} from "./helper";

export const stage: RawStage = {
    name: "Постмодерн",
    internalName: "Ботаника",
    quests: [
        "Пароль: мыкоманда",

        "На чём сейчас находится памятный знак?" + getVideo(
            false,
            "https://www.youtube.com/embed/jZPlIlKMJFc",
            "https://www.youtube.com/embed/zLPh8YsJb2g",
            "https://www.youtube.com/embed/ZRimt_3d49Y",
            "https://www.youtube.com/embed/5Qp55HzZmTQ"),


        `На здании, в котором обитают сразу 4 совы, есть вывеска, обещающая перемещение в пространстве при пересечении порога. 
Врядли это случится, поэтому найдите способ попасть туда сами. 
Переведите и найдите здание 91 на Московской дороге. Нас интересует первые два белых слова на голубом фоне.`,


        `Загадано здание. Заходить на территорию не надо - там могут быть чувствительные люди. 
        Перечислите, какие три дня недели указаны на щите у входа?` + getVideo(true, "https://www.youtube.com/embed/dbvk8_Fy9RM"),


        `В месте отправления посчитайте количество эмблем скрещенных молотов.` + getVideo(true, "https://www.youtube.com/embed/me6vAVmXR_Q"),

        `В загаданном месте посчитайте количество светлых четырехугольников вокруг.<br>

<img style='height: auto;width: auto; max-width: 200px;max-height: 200px;' src='/statics/stages/stage_2/quad_count.png'/>
<br>
<a style="text-decoration:underline !important" href="/statics/stages/stage_2/quad_count.png">High resolution link</a>
`,


        `Вам нужно графити с обратной стороны загаданного здания. 
Помимо прочего у персонажа в волосах застряла табличка, которую вам надо рассмотреть. 
Назовите категорию помещения.` + getVideo(true, "https://www.youtube.com/embed/bYsl0GIZmD4")
    ],


    bonuses: []
};



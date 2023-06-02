import {
        User
} from './User.js';

import {
        Event
} from './Event.js';

let me = new User('Mullier', 'Tom', "tom.mullier@outlook.fr", "0768868797", "N3", "" ,"S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-03");

let events =[];
events.push(new Event(new Date(2023, 5, 1, 10, 0), new Date(2023, 5, 1, 12, 0), 20, 10, "La Ciotat", " Commentaire Commentaire ", " Besoin Besoin Besoin", false, 5, 3, "Exploration"));
events.push(new Event(new Date(2023, 5, 2, 14, 0), new Date(2023, 5, 2, 16, 0), 60, 10, "JUNIA", "Enguerrand j'espère tu seras à l'heure", "VP03", false, 5, 3, "Technique"));
events.push(new Event(new Date(2023, 5, 2, 10, 0), new Date(2023, 5, 2, 10, 30), 30, 10, "Décathlon", "tomtom tomt om", "oui oui oui", false, 5, 3, "Exploration"));

export {
        me,
        events
} //exporter les variables pour les utiliser dans d'autres fichiers

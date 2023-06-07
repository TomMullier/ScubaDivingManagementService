import {
        User
} from './User.js';

import {
        Event
} from './Event.js';

import {
        Location
} from './Location.js';

import {
        Rate
} from './Rate.js';

let all_user = [];
all_user.push(new User('Mullier', 'Tom', "tom.mullier@outlook.fr", "0768868797", "N3", "", "S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-07"))
all_user.push(new User('Mullier', 'Max', "tom.mullier@outlook.fr", "0768868797", "N3", "", "S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-07"))
all_user.push(new User('Mullier', 'Elen', "tom.mullier@outlook.fr", "0768868797", "N3", "", "S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-07"))
all_user.push(new User('Mullier', 'Maxime', "tom.mullier@outlook.fr", "0768868797", "N3", "", "S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-07"))
all_user.push(new User('Mullier', 'Eng', "tom.mullier@outlook.fr", "0768868797", "N3", "", "S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-07"))
all_user.push(new User('Mullier', 'Alan', "tom.mullier@outlook.fr", "0768868797", "N3", "", "S", "", "123456789", "2020-12-30", "2020-12-31", "2003-01-07"))


let events = [];
events.push(new Event(new Date(2023, 5, 5, 10, 0), new Date(2023, 5, 5, 12, 0), 20, 10, "Béthune", " Commentaire Commentaire ", " Besoin Besoin Besoin", false, 5, 3, "Exploration"));
events.push(new Event(new Date(2023, 5, 5, 14, 0), new Date(2023, 5, 5, 16, 0), 60, 10, "JUNIA", "Enguerrand j'espère tu seras à l'heure", "VP03", false, 5, 3, "Technique"));
events.push(new Event(new Date(2023, 5, 6, 10, 0), new Date(2023, 5, 6, 10, 30), 30, 10, "Décathlon", "tomtom tomt om", "oui oui oui", false, 5, 3, "Exploration"));
events.push(new Event(new Date(2023, 5, 7, 10, 0), new Date(2023, 5, 7, 10, 30), 30, 10, "Décathlon", "tomtom tomt om", "oui oui oui", false, 5, 3, "Exploration"));

let locations = [];
locations.push(new Location("Béthune", 1, 1, "rue", 21, "Hinges", 62400, "Béthune", "France", "", 1234567890, "www.www", new Rate()));
locations.push(new Location("Lille", 1, 1, "rue", 21, "Hinges", 62400, "Béthune", "France", "", 1234567890, "www.www", new Rate()));
locations.push(new Location("Arras", 1, 1, "rue", 21, "Hinges", 62400, "Béthune", "France", "", 1234567890, "www.www", new Rate()));
locations.push(new Location("Valence", 1, 1, "rue", 21, "Hinges", 62400, "Béthune", "France", "", 1234567890, "www.www", new Rate()));


export {
        events,
        all_user,
        locations
} 
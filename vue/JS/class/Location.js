class Location {
        constructor(name, lat, lng, trackType, trackNumber, trackName, zipCode, cityName, country, additional ="", phone, url, rate, SOS_Tel_Number, Emergency_Plan, Post_Accident_Procedure) {
                this.name = name;
                this.lat = lat;
                this.lng = lng;
                this.trackType = trackType;
                this.trackNumber = trackNumber;
                this.trackName = trackName;
                this.zipCode = zipCode;
                this.cityName = cityName;
                this.country = country;
                this.additional = additional;
                this.phone = phone;
                this.url = url;
                this.rate = rate;
                this.SOS_Tel_Number = SOS_Tel_Number;
                this.Emergency_Plan = Emergency_Plan;
                this.Post_Accident_Procedure = Post_Accident_Procedure;
        }
}

export {
        Location
} //exporter les variables pour les utiliser dans d'autres fichiers
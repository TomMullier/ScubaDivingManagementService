class Location {
        constructor(name, lat, lng, trackType, trackNumber, trackName, zipCode, cityName, country, additional ="", phone, url) {
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
        }
}
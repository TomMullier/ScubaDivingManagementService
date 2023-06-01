class Event {
        constructor(start, end, divePrice, InstructorPrice, location, comment, needs, open, max, maxlevel, diveType) {
                this.start = start;
                this.end = end;
                this.divePrice = divePrice;
                this.InstructorPrice = InstructorPrice;
                this.location = location;
                this.comment = comment;
                this.needs = needs;
                this.title=diveType+" à "+location;
                this.open=open;
                this.max=max;
                this.maxlevel=maxlevel;
                this.users = [];
                this.diveType=diveType;
        }

        addUser(user) {
                this.users.push(user);
        }

        getUsers() {
                return this.users;
        }

        removeUser(user) {
                this.users.splice(this.users.indexOf(user), 1);
        }

        getStart() {
                return this._start;
        }
        setStart(value) {
                this._start = value;
        }
        getEnd() {
                return this._end;
        }
        setEnd(value) {

                this._end = value;
        }
        getDivePrice() {
                return this._divePrice;
        }
        setDivePrice(value) {
                this._divePrice = value;
        }
        getInstructorPrice() {
                return this._InstructorPrice;
        }
        setInstructorPrice(value) {
                this._InstructorPrice = value;
        }
        getLocation() {
                return this._location;
        }
        setLocation(value) {
                this._location = value;
        }
        getComment() {
                return this._comment;
        }
        setComment(value) {
                this._comment = value;
        }
        getNeeds() {
                return this._needs;
        }
        setNeeds(value) {
                this._needs = value;
        }
        getOpen() {
                return this.open;
        }
        setOpen(value) {
                this.open = value;
        }
        getMax() {
                return this.max;
        }
        setMax(value) {
                this.max = value;
        }


}

export {Event};
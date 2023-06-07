class Rate {
        constructor() {
                this.generalRate = [];
                this.locationRate = [];
                this.organisationRate = [];
                this.conditionsRate = [];
        }

        addRate(rates) {
                this.generalRate.push(rates.generalRate);
                this.locationRate.push(rates.locationRate);
                this.organisationRate.push(rates.organisationRate);
                this.conditionsRate.push(rates.conditionsRate);
        }

        getMeanRate() {
                let mean=[];
                let mean_ = 0;
                for (let i = 0; i < this.generalRate.length; i++) {
                        mean_ += this.generalRate[i];
                }
                mean.push(mean_ / this.generalRate.length);
                mean_ = 0;
                for (let i = 0; i < this.locationRate.length; i++) {
                        mean_ += this.locationRate[i];
                }
                mean.push(mean_ / this.locationRate.length);
                mean_ = 0;
                for (let i = 0; i < this.organisationRate.length; i++) {
                        mean_ += this.organisationRate[i];
                }
                mean.push(mean_ / this.organisationRate.length);
                mean_ = 0;
                for (let i = 0; i < this.conditionsRate.length; i++) {
                        mean_ += this.conditionsRate[i];
                }
                mean.push(mean_ / this.conditionsRate.length);
                return mean;
        }
        getNumberOfRate(){
                return this.generalRate.length;
        }

}

export {
        Rate
}
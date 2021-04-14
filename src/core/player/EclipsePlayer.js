const { Structure } = require("erela.js")

module.exports = Structure.extend('Player', Player => {
    class EclipsePlayer extends Player {
        constructor(...args) {
            super(...args)
            this.speed = 1;
            this.pitch = 1;
            this.rate = 1;
            this.nightcore = false;
            this.vaporwave = false;
            this.bassboost = false;
        }
        
        setSpeed(speed) {
            if (isNaN(speed))
                throw new RangeError("Player#setSpeed() Speed must be a number.");
            this.speed = Math.max(Math.min(speed, 5), 0.05);
            this.setTimescale(speed)
            return this;
        }

        setPitch(pitch) {
            if (isNaN(pitch))
                throw new RangeError("Player#setPitch() Pitch must be a number.");
            this.pitch = Math.max(Math.min(pitch, 5), 0.05);
            this.setTimescale(this.speed, pitch)
            return this;
        }

        setNightcore(nighcore) {
            if (typeof nighcore !== "boolean")
                throw new RangeError('Player#setNighcore() Nightcore can only be "true" or "false".');

            this.nightcore = nighcore;
            if(nighcore) {
                this.vaporwave = false;
                this.setTimescale(1.2999999523162842, 1.2999999523162842, 1);
            } else this.setTimescale(1, 1, 1);
            return this;
        }

        setVaporwave(vaporwave) {
            if (typeof vaporwave !== "boolean")
                throw new RangeError('Player#setVaporwave() Vaporwave can only be "true" or "false".');

            this.vaporwave = vaporwave;
            if(vaporwave) {
                this.nightcore = false;
                this.setTimescale(0.8500000238418579, 0.800000011920929, 1);
            } else this.setTimescale(1, 1, 1);
            return this;
        }

        setBassboost(bassboost) {
            if (typeof bassboost !== 'boolean')
                throw new RangeError('Player#setBassboost() Bassboost can only be "true" or "false"');
            
            this.bassboost = bassboost;
            if(bassboost) {
                this.setVaporwave(false);
                this.setNightcore(false);
                this.setEqualizer(1, 0.85)
            } else this.clearEffects()
            return this;
        }

        setEqualizer(band, gain) {
            this.band = band || this.band;
            this.gain = gain || this.gain;

            this.node.send({
                op: 'filters',
                guildId: this.guild,
                equalizer: [
                    {
                        band: this.band,
                        gain: this.gain
                    },
                    {
                        band: this.band,
                        gain: this.gain
                    },
                    {
                        band: this.band,
                        gain: this.gain
                    },
                    {
                        band: this.band,
                        gain: this.gain
                    },
                    {
                        band: this.band,
                        gain: this.gain
                    },
                    {
                        band: this.band,
                        gain: this.gain
                    }
                ]
            })
        }

        setTimescale(speed, pitch, rate) {
            this.speed = speed || this.speed;
            this.pitch = pitch || this.pitch;
            this.rate = rate || this.rate;

            this.node.send({
                op: "filters",
                guildId: this.guild,
                timescale: {
                    speed: this.speed,
                    pitch: this.pitch,
                    rate: this.rate
                },
            });
            return this;
        }

        clearEffects() {
            this.speed = 1;
            this.pitch = 1;
            this.rate = 1;
            this.bassboost = false;
            this.nightcore = false;
            this.vaporwave = false;

            this.clearEQ();

            this.node.send({
                op: "filters",
                guildId: this.guild
            });
            return this;
        }
    }
    return EclipsePlayer
})

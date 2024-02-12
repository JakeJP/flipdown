var FlipDown = /** @class */ (function () {
    function FlipDown(uts, el, opt, actions) {
        if (el === void 0) { el = "flipdown"; }
        this.version = FlipDown.version;
        this.initialised = false;
        this.rotorGroups = [];
        // default options
        this.opts = {
            theme: 'dark',
            headings: FlipDown.headings,
            headingsAt: "top",
            digits: "auto",
            direction: "down",
            stopAtEnd: true,
            delimiter: true,
            tick: null,
            ended: null,
        };
        // If uts is not specified
        if (typeof uts !== "number" && !(uts instanceof Date)) {
            throw new Error("FlipDown: Constructor expected unix timestamp, got ".concat(typeof uts, " instead."));
        }
        // If opt is specified, but not el
        if (typeof el === "object") {
            opt = el;
            el = "flipdown";
        }
        // Time at instantiation in seconds
        this.now = this._getTime();
        // UTS to count down to
        this.epoch =
            uts instanceof Date ? uts.getTime() / 1000
                : uts;
        // UTS passed to FlipDown is in the past
        this.countdownEnded = false;
        // User defined callback for countdown end
        this.hasEndedCallback = null;
        // FlipDown DOM element
        this.element = document.getElementById(el);
        // Parse options
        this._parseOptions(opt);
        this.setTheme(this.opts.theme);
        // Print Version
        console.log("FlipDown ".concat(FlipDown.version, " (Theme: ").concat(this.opts.theme, ")"));
    }
    /**
     * @name start
     * @description Start the countdown
     * @author PButcher
     **/
    FlipDown.prototype.start = function () {
        // Initialise the clock
        if (!this.initialised)
            this._init();
        // Set up the countdown interval
        this.countdown = setInterval(this._tick.bind(this), 1000);
        this.element.classList.remove("flipdown-stopped");
        // Chainable
        return this;
    };
    FlipDown.prototype.stop = function () {
        if (this.countdown) {
            clearInterval(this.countdown);
            this.countdown = null;
            this.element.classList.add("flipdown-stopped");
        }
        return this;
    };
    FlipDown.prototype.setTheme = function (name) {
        if (this.opts.theme != name) {
            this.element.classList.remove("".concat(FlipDown.themeprefix).concat(this.opts.theme));
        }
        this.element.classList.add("".concat(FlipDown.themeprefix).concat(name));
        this.opts.theme = name;
    };
    FlipDown.prototype.getTheme = function () {
        return this.opts.theme;
    };
    /**
     * @name ifEnded
     * @description Call a function once the countdown ends
     * @author PButcher
     * @param {function} cb - Callback
     **/
    FlipDown.prototype.ifEnded = function (cb) {
        var me = this;
        this.hasEndedCallback = function () {
            cb();
            me.hasEndedCallback = null;
        };
        // Chainable
        return this;
    };
    /**
     * @name _getTime
     * @description Get the time in seconds (unix timestamp)
     * @author PButcher
     **/
    FlipDown.prototype._getTime = function () {
        return new Date().getTime() / 1000;
    };
    /**
     * @name _hasCountdownEnded
     * @description Has the countdown ended?
     * @author PButcher
     **/
    FlipDown.prototype._hasCountdownEnded = function () {
        // Countdown has ended
        if (this.epoch - this.now < 0) {
            this.countdownEnded = true;
            // Fire the ifEnded callback once if it was set
            if (this.hasEndedCallback != null) {
                // Call ifEnded callback
                this.hasEndedCallback();
                // Remove the callback
                this.hasEndedCallback = null;
            }
            if (this.opts.ended && typeof this.opts.ended == "function")
                this.opts.ended.call(this, this.now);
            this.element.classList.add("flipdown-ended");
            return true;
            // Countdown has not ended
        }
        else {
            this.countdownEnded = false;
            return false;
        }
    };
    /**
     * @name _parseOptions
     * @description Parse any passed options
     * @param {object} opt - Optional configuration settings
     * @author PButcher
     **/
    FlipDown.prototype._parseOptions = function (opt) {
        for (var m in this.opts) {
            if (opt.hasOwnProperty(m))
                this.opts[m] = opt[m];
        }
    };
    /**
     * @name _init
     * @description Initialise the countdown
     * @author PButcher
     **/
    FlipDown.prototype._init = function () {
        var _this = this;
        this.initialised = true;
        var daysremaining = Math.floor((this.epoch - this.now) / 86400);
        // Create day rotor group
        this.rotorGroups.push(new FlipDown.RotorGroup(daysremaining < 100 ? 2 : daysremaining.toString().length, this.opts.headings ? this.opts.headings[0] : null, false, this.opts.headingsAt));
        // Create other rotor groups
        for (var i = 0; i < 3; i++) {
            this.rotorGroups.push(new FlipDown.RotorGroup(2, this.opts.headings ? this.opts.headings[i + 1] : null, this.opts.delimiter, this.opts.headingsAt));
        }
        // Set initial values;
        this._tick();
        this._updateClockValues();
        // append all elements at a time
        var precedingZeroToHide = this.opts.digits == "auto";
        this.rotorGroups.forEach(function (g) {
            if (precedingZeroToHide) {
                if (g.clockValue == 0) {
                    g.element.style.display = "none";
                }
                else
                    precedingZeroToHide = false;
            }
            _this.element.appendChild(g.element);
        });
        return this;
    };
    /**
     * @name _tick
     * @description Calculate current tick
     * @author PButcher
     **/
    FlipDown.prototype._tick = function () {
        // Get time now
        this.now = this._getTime();
        // Between now and epoch
        var diff = this.epoch - this.now <= 0 ? (this.opts.stopAtEnd ? 0 : this.now - this.epoch) : this.epoch - this.now;
        var index = 0;
        var clockValue;
        // Days remaining
        clockValue = this.rotorGroups[index++].clockValue = Math.floor(diff / 86400);
        diff -= clockValue * 86400;
        // Hours remaining
        this.rotorGroups[index++].clockValue = clockValue = Math.floor(diff / 3600);
        diff -= clockValue * 3600;
        // Minutes remaining
        this.rotorGroups[index++].clockValue = clockValue = Math.floor(diff / 60);
        diff -= clockValue * 60;
        // Seconds remaining
        this.rotorGroups[index++].clockValue = clockValue = Math.floor(diff);
        if (this.opts.tick && typeof this.opts.tick == "function")
            this.opts.tick.call(this, this.epoch - this.now, this.now);
        // Update clock values
        this._updateClockValues();
        // Has the countdown ended?
        this._hasCountdownEnded();
    };
    /**
     * @name _updateClockValues
     * @description Update the clock face values
     * @author PButcher
     * @param {boolean} init - True if calling for initialisation
     **/
    FlipDown.prototype._updateClockValues = function () {
        this.rotorGroups.forEach(function (r) { return r.updateClockValue(); });
    };
    FlipDown.version = "0.3.4 j";
    FlipDown.headings = ["Days", "Hours", "Minutes", "Seconds"];
    FlipDown.themeprefix = "flipdown__theme-";
    return FlipDown;
}());
(function (FlipDown) {
    /**
     * @name FlipDown
     * @description Flip styled countdown clock
     * @author Peter Butcher (PButcher) <pbutcher93[at]gmail[dot]com>
     * @param {number} uts - Time to count down to as unix timestamp
     * @param {string} el - DOM element to attach FlipDown to
     * @param {object} opt - Optional configuration settings
     **/
    var Rotor = /** @class */ (function () {
        function Rotor() {
        }
        Rotor.prototype.setText = function (text) {
            this.rotorLeafFront.textContent = this.prevClockValue;
            this.rotorBottom.textContent = this.prevClockValue;
            var me = this;
            function rotorTopFlip() {
                if (me.rotorTop.textContent != text) {
                    me.rotorTop.textContent = text;
                }
            }
            function rotorLeafRearFlip() {
                var el = me.rotorLeafRear;
                if (el.textContent != text) {
                    el.textContent = text;
                    el.parentElement.classList.add("flipped");
                    var flip = setInterval(function () {
                        el.parentElement.classList.remove("flipped");
                        clearInterval(flip);
                    }.bind(this), 500);
                }
            }
            // Init
            if (this.prevClockValue) {
                setTimeout(rotorTopFlip.bind(this), 500);
                setTimeout(rotorLeafRearFlip.bind(this), 500);
            }
            else {
                rotorTopFlip.call(this);
                rotorLeafRearFlip.call(this);
            }
            this.prevClockValue = text;
        };
        return Rotor;
    }());
    FlipDown.Rotor = Rotor;
    ;
    var RotorGroup = /** @class */ (function () {
        function RotorGroup(numRotors, label, delimiter, labelAt) {
            var _this = this;
            var element = document.createElement("div");
            element.className = "rotor-group";
            if (label) {
                var dayRotorGroupHeading = document.createElement("div");
                dayRotorGroupHeading.className = "rotor-group-heading";
                dayRotorGroupHeading.setAttribute("data-before", label);
                if (labelAt == "bottom")
                    dayRotorGroupHeading.classList.add("bottom");
                element.appendChild(dayRotorGroupHeading);
            }
            if (delimiter) {
                element.classList.add("delimiter");
            }
            this.element = element;
            this.rotors = [];
            for (var i = 0; i < numRotors; i++) {
                var r = this._createRotor();
                this.rotors.push(r);
            }
            this.rotors.forEach(function (r) { return _this.element.appendChild(r.element); });
        }
        /**
         * @name _createRotor
         * @description Create a rotor DOM element
         * @author PButcher
         * @param {number} v - Initial rotor value
         **/
        RotorGroup.prototype._createRotor = function (v) {
            if (v === void 0) { v = 0; }
            var o = new Rotor();
            var rotor = o.element = document.createElement("div");
            rotor.className = "rotor";
            o.rotorLeaf = document.createElement("div");
            o.rotorLeafRear = document.createElement("figure");
            o.rotorLeafFront = document.createElement("figure");
            o.rotorTop = document.createElement("div");
            o.rotorBottom = document.createElement("div");
            o.rotorLeaf.className = "rotor-leaf";
            o.rotorLeafRear.className = "rotor-leaf-rear";
            o.rotorLeafFront.className = "rotor-leaf-front";
            o.rotorTop.className = "rotor-top";
            o.rotorBottom.className = "rotor-bottom";
            o.rotorLeafRear.textContent = v.toString();
            o.rotorTop.textContent = v.toString();
            o.rotorBottom.textContent = v.toString();
            [o.rotorLeaf, o.rotorTop, o.rotorBottom].forEach(function (r) { return o.element.appendChild(r); });
            [o.rotorLeafRear, o.rotorLeafFront].forEach(function (r) { return o.rotorLeaf.appendChild(r); });
            return o;
        };
        RotorGroup.prototype.updateClockValue = function () {
            var clockValueAsString = this.pad(this.clockValue, 2);
            var index = 0;
            this.rotors.forEach(function (r) {
                r.setText(clockValueAsString[index++]);
            });
        };
        /**
         * @name pad
         * @description Prefix a number with zeroes
         * @author PButcher
         * @param {string} n - Number to pad
         * @param {number} len - Desired length of number
         **/
        RotorGroup.prototype.pad = function (n, len) {
            n = n.toString();
            return n.length < len ? this.pad("0" + n, len) : n;
        };
        return RotorGroup;
    }());
    FlipDown.RotorGroup = RotorGroup;
})(FlipDown || (FlipDown = {}));

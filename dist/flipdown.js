var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * @name FlipDown
 * @description Flip styled countdown clock
 * @author Peter Butcher (PButcher) <pbutcher93[at]gmail[dot]com>, Jake Yoshimura (JakeJP) <yo-ki[at]yo-ki[dot].com>
 * @param {number} uts - Time to count down to as unix timestamp
 * @param {string} el - DOM element to attach FlipDown to
 * @param {object} opt - Optional configuration settings
 **/
var FlipDown = /** @class */ (function () {
    function FlipDown(uts, el, opt, actions) {
        if (el === void 0) { el = "flipdown"; }
        this.version = FlipDown.version;
        this.initialised = false;
        this.children = [];
        // default options
        this.opts = {
            theme: 'dark',
            headings: FlipDown.headings,
            headingsAt: "top",
            digits: "auto",
            rotor: null,
            direction: "down",
            stopAtEnd: true,
            delimiters: ['&nbsp;', ':', ':', ''],
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
    Object.defineProperty(FlipDown.prototype, "rotorGroups", {
        get: function () {
            return this.children.filter(function (g) { return g instanceof FlipDown.RotorGroup; });
        },
        enumerable: false,
        configurable: true
    });
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
        var labelAt = !this.opts.headingsAt || !this.opts.headings ? null : this.opts.headingsAt;
        var headings = this.opts.headings || FlipDown.emptyHeadings;
        var delimiters = this.opts.delimiters || FlipDown.emptyDelimiters;
        // Create day rotor group
        this.children.push(new FlipDown.RotorGroup(this.opts.rotor || (daysremaining < 100 ? 2 : daysremaining.toString().length), headings[0], labelAt));
        //if( delimiters[0] )
        this.children.push(new FlipDown.Delimiter(delimiters[0], labelAt));
        // Create other rotor groups
        for (var i = 0; i < 3; i++) {
            this.children.push(new FlipDown.RotorGroup(this.opts.rotor || 2, headings[i + 1], labelAt));
            //if( delimiters[i+1] )
            this.children.push(new FlipDown.Delimiter(delimiters[i + 1], labelAt));
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
                    g.element.classList.add("hidden");
                }
                else
                    precedingZeroToHide = false;
            }
        });
        this.children.forEach(function (i) { return _this.element.appendChild(i.element); });
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
        var divs = [86400, 3600, 60, 1];
        this.rotorGroups
            .forEach(function (g, i) {
            clockValue = g.clockValue = Math.floor(diff / divs[i]);
            diff -= clockValue * divs[i];
        });
        if (this.opts.tick && typeof this.opts.tick == "function")
            this.opts.tick.call(this, this.epoch - this.now, this.now);
        // Update clock values
        this._updateClockValues();
        // Has the countdown ended?
        this._hasCountdownEnded();
    };
    FlipDown.prototype._updateClockValues = function () {
        this.rotorGroups.forEach(function (r) { return r.updateClockValue(); });
    };
    FlipDown.version = "0.3.4 j";
    FlipDown.headings = ["Days", "Hours", "Minutes", "Seconds"];
    FlipDown.themeprefix = "flipdown__theme-";
    FlipDown.emptyDelimiters = ['', '', '', ''];
    FlipDown.emptyHeadings = [null, null, null, null];
    return FlipDown;
}());
(function (FlipDown) {
    var Rotor = /** @class */ (function () {
        function Rotor(v) {
            var o = this;
            var rotor = o.element = document.createElement("div");
            rotor.className = "rotor";
            rotor.innerHTML = "<div class='rotor-leaf'><div class='rotor-leaf-rear'><div class='digit'></div></div><div class='rotor-leaf-front'><div class='digit'></div></div></div>"
                + "<div class='rotor-top'><div class='digit'></div></div><div class='rotor-bottom'><div class='digit'></div></div>";
            o.rotorLeaf = rotor.querySelector("[class='rotor-leaf']");
            o.rotorLeafRear = rotor.querySelector("[class='rotor-leaf-rear'] [class='digit']");
            o.rotorLeafFront = rotor.querySelector("[class='rotor-leaf-front'] [class='digit']");
            o.rotorTop = rotor.querySelector("[class='rotor-top'] [class='digit']");
            o.rotorBottom = rotor.querySelector("[class='rotor-bottom'] [class='digit']");
            var text = v.toString();
            o.rotorLeafRear.textContent = text;
            o.rotorTop.textContent = text;
            o.rotorBottom.textContent = text;
        }
        Rotor.prototype.setText = function (text) {
            //if( this.prevClockValue && text == this.prevClockValue )
            //  return;
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
                    me.rotorLeaf.classList.add("flipped");
                    var flip = setInterval(function () {
                        me.rotorLeaf.classList.remove("flipped");
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
    var Delimiter = /** @class */ (function () {
        function Delimiter(label, labelAt) {
            this.label = label;
            var element = this.element = document.createElement("div");
            this.element.classList.add("rotor-group");
            if (labelAt)
                this.element.classList.add(labelAt);
            this.initElement();
        }
        Delimiter.prototype.initElement = function () {
            this.element.classList.add("delimiter");
            var del = document.createElement("div");
            del.innerHTML = this.label;
            this.element.appendChild(del);
        };
        return Delimiter;
    }());
    FlipDown.Delimiter = Delimiter;
    var RotorGroup = /** @class */ (function (_super) {
        __extends(RotorGroup, _super);
        function RotorGroup(numRotors, label, labelAt) {
            var _this = _super.call(this, label, labelAt) || this;
            // rotors
            _this.rotors = [];
            for (var i = 0; i < numRotors; i++) {
                var r = new Rotor(0);
                _this.rotors.push(r);
            }
            _this.rotors.forEach(function (r) { return _this.element.appendChild(r.element); });
            return _this;
        }
        RotorGroup.prototype.initElement = function () {
            if (this.label /*&& (labelAt == "top" || labelAt == "bottom")*/) {
                this.elementLabel = document.createElement("div");
                this.elementLabel.classList.add("rotor-group-heading");
                this.element.appendChild(this.elementLabel);
            }
            if (this.elementLabel) {
                this.elementLabel.innerHTML = this.label;
            }
        };
        RotorGroup.prototype.updateClockValue = function () {
            var nnn = this.pad(this.clockValue, 2);
            var index = 0;
            var rr = this.rotors.length;
            var p;
            var ri = 0;
            var i = 0;
            if (rr < nnn.length) {
                p = nnn.substring(0, nnn.length - rr + 1);
                i = nnn.length - rr;
            }
            else
                p = nnn[0];
            for (; i < nnn.length; p = nnn[++i]) {
                this.rotors[ri++].setText(p);
            }
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
    }(Delimiter));
    FlipDown.RotorGroup = RotorGroup;
})(FlipDown || (FlipDown = {}));

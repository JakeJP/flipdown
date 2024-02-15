type Options = {
  theme: string,
  headings: Array<string> | null | boolean,
  headingsAt: "top" | "bottom" | "left" | "right",
  delimiters: Array<string>,
  digits: "auto" | null,
  rotor: number | null,
  direction : "down" | "up",
  stopAtEnd?: boolean,
  tick?: ((tick) => void) | null,
  ended?: ((tick) => void) | null,
};
/**
 * @name FlipDown
 * @description Flip styled countdown clock
 * @author Peter Butcher (PButcher) <pbutcher93[at]gmail[dot]com>, Jake Yoshimura (JakeJP) <yo-ki[at]yo-ki[dot].com>
 * @param {number} uts - Time to count down to as unix timestamp
 * @param {string} el - DOM element to attach FlipDown to
 * @param {object} opt - Optional configuration settings
 **/
class FlipDown {
  static version: string = "0.3.4 j";
  static headings: Array<string> = ["Days", "Hours", "Minutes", "Seconds"];
  static themeprefix: string = "flipdown__theme-";
  static emptyDelimiters: Array<string> = ['','','',''];
  static emptyHeadings: Array<string|null> = [null,null,null,null];
  version: string = FlipDown.version;
  initialised: boolean = false;
  now: number;
  epoch: number;
  countdownEnded: boolean;
  hasEndedCallback: (() => void) | null;
  element: HTMLElement;
  children: Array<FlipDown.RotorGroup | FlipDown.Delimiter> = [];
  get rotorGroups(): Array<FlipDown.RotorGroup> {
    return <Array<FlipDown.RotorGroup>>this.children.filter(g => g instanceof FlipDown.RotorGroup);
  }
  // stores setInterval timer
  countdown: number | null;
  // default options
  opts: Options = {
      theme: 'dark',
      headings: FlipDown.headings,
      headingsAt: "top",
      digits: "auto",
      rotor: null,
      direction: "down",
      stopAtEnd: true,
      delimiters: ['&nbsp;',':',':',''],
      tick: null,
      ended: null,
    };

  constructor(uts: Date | number, el = "flipdown", opt? : any ) {

    // If uts is not specified
    if (typeof uts !== "number" && !(uts instanceof Date)) {
      throw new Error(
        `FlipDown: Constructor expected unix timestamp, got ${typeof uts} instead.`
      );
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
        : uts as number;
    // UTS passed to FlipDown is in the past
    this.countdownEnded = false;
    // User defined callback for countdown end
    this.hasEndedCallback = null;
    // FlipDown DOM element
    this.element = document.getElementById(el)!;
    // Parse options
    this._parseOptions(opt as Options);
    this.setTheme( this.opts.theme );

    this._init();
    // Print Version
    console.log(`FlipDown ${FlipDown.version} (Theme: ${this.opts.theme})`);
  }

  /**
   * @name start
   * @description Start the countdown
   * @author PButcher
   **/
  start() {
    // Set up the countdown interval
    this.countdown = setInterval(this._tick.bind(this), 1000);
    this.element.classList.remove("flipdown-stopped");
    // Chainable
    return this;
  }
  stop(){
    if(this.countdown){
      clearInterval(this.countdown);
      this.countdown = null;
      this.element.classList.add("flipdown-stopped");
    }
    return this;
  }
  setTheme( name ){
    if( this.opts.theme != name){
      this.element.classList.remove(`${FlipDown.themeprefix}${this.opts.theme}`);
    }
    this.element.classList.add(`${FlipDown.themeprefix}${name}`);
    this.opts.theme = name;
  }
  getTheme(){
    return this.opts.theme;
  }
  /**
   * @name ifEnded
   * @description Call a function once the countdown ends
   * @author PButcher
   * @param {function} cb - Callback
   **/
  ifEnded(cb) {
    var me = this;
    this.hasEndedCallback = function () {
      cb();
      me.hasEndedCallback = null;
    };

    // Chainable
    return this;
  }

  /**
   * @name _getTime
   * @description Get the time in seconds (unix timestamp)
   * @author PButcher
   **/
  private _getTime() {
    return new Date().getTime() / 1000;
  }

  /**
   * @name _hasCountdownEnded
   * @description Has the countdown ended?
   * @author PButcher
   **/
  private _hasCountdownEnded() {
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
      if( this.opts.ended && typeof this.opts.ended == "function")
        this.opts.ended.call(this,this.now);

      this.element.classList.add("flipdown-ended");

      return true;

      // Countdown has not ended
    } else {
      this.countdownEnded = false;
      return false;
    }
  }

  /**
   * @name _parseOptions
   * @description Parse any passed options
   * @param {object} opt - Optional configuration settings
   * @author PButcher
   **/
  private _parseOptions(opt : Options ) : void {
    for( var m in this.opts ){
      if( opt.hasOwnProperty(m) )
        this.opts[m] = opt[m];
    }
  }

  /**
   * @name _init
   * @description Initialise the countdown
   * @author PButcher
   **/
  private _init() {
    this.initialised = true;

    var daysremaining = Math.floor( (this.epoch - this.now) / 86400 );
    var labelAt = !this.opts.headingsAt || !this.opts.headings ? null : this.opts.headingsAt;
    var headings = this.opts.headings || FlipDown.emptyHeadings;
    var delimiters = this.opts.delimiters || FlipDown.emptyDelimiters;
    // Create day rotor group
    this.children.push(new FlipDown.RotorGroup(
      this.opts.rotor || ( daysremaining < 100 ? 2 : daysremaining.toString().length ),
      headings[0], labelAt ));
    //if( delimiters[0] )
      this.children.push(new FlipDown.Delimiter( delimiters[0], labelAt ));
        
    // Create other rotor groups
    for (var i = 0; i < 3; i++) {
      this.children.push(
        new FlipDown.RotorGroup( this.opts.rotor || 2, headings[i+1], labelAt ));
      //if( delimiters[i+1] )
        this.children.push(
          new FlipDown.Delimiter( delimiters[i+1], labelAt ));
    }

    // Set initial values;
    this._tick();
    // append all elements at a time
    var precedingZeroToHide = this.opts.digits == "auto";
    
    this.rotorGroups.forEach( g => {
      if( precedingZeroToHide ){
        if( g.clockValue == 0 ){
          g.element.style.display = "none";
          g.element.classList.add("hidden");
        }
        else
          precedingZeroToHide = false;
      }
    });
    this.children.forEach( i => this.element.appendChild(i.element));
  }

  /**
   * @name _tick
   * @description Calculate current tick
   * @author PButcher
   **/
  private _tick() {
    // Get time now
    this.now = this._getTime();
    // Between now and epoch
    var diff = this.epoch - this.now <= 0 ? (this.opts.stopAtEnd ? 0 : this.now - this.epoch ) : this.epoch - this.now;

    var index = 0;
    var clockValue: number;
    var divs = [86400, 3600, 60, 1];
    this.rotorGroups.forEach( (g, i) => {
      clockValue = g.clockValue = Math.floor(diff / divs[i]);
      diff -= clockValue * divs[i];
    })
   
    if( this.opts.tick && typeof this.opts.tick == "function")
      this.opts.tick.call( this, this.epoch - this.now, this.now );
    // Update clock values
    this.rotorGroups.forEach(r => r.updateClockValue());

    // Has the countdown ended?
    this._hasCountdownEnded();
  }
}
namespace FlipDown {
  export class Rotor {
    element: HTMLElement;
    value: number;
    rotorLeaf: HTMLElement;
    rotorLeafRear: HTMLElement;
    rotorLeafFront: HTMLElement;
    rotorTop: HTMLElement;
    rotorBottom: HTMLElement;
    prevClockValue: string;
    constructor(){
      var o = this;
      var rotor = o.element = document.createElement("div");
      rotor.className = "rotor";
      rotor.innerHTML = "<div class='rotor-leaf'><div class='rotor-leaf-rear'><div class='digit'></div></div><div class='rotor-leaf-front'><div class='digit'></div></div></div>"
        + "<div class='rotor-top'><div class='digit'></div></div><div class='rotor-bottom'><div class='digit'></div></div>";

      o.rotorLeaf= rotor.querySelector("[class='rotor-leaf']")!;
      o.rotorLeafRear = rotor.querySelector("[class='rotor-leaf-rear'] [class='digit']")!;
      o.rotorLeafFront = rotor.querySelector("[class='rotor-leaf-front'] [class='digit']")!;
      o.rotorTop = rotor.querySelector("[class='rotor-top'] [class='digit']")!;
      o.rotorBottom = rotor.querySelector("[class='rotor-bottom'] [class='digit']")!;

      o.rotorLeaf.addEventListener("transitionend", (e : TransitionEvent) => o.transitionend(e) ); 
    }
    setText( text: string) : void {
      var me = this;
      if( me.prevClockValue && text === me.prevClockValue )
        return;

      me.rotorLeafFront.textContent = me.prevClockValue || text;
      me.rotorBottom.textContent = me.prevClockValue || text;

      me.rotorTop.textContent = text;

      me.rotorLeafRear.textContent = text;
      
      if( me.prevClockValue ){
        me.rotorLeaf.classList.remove("flipped");
        me.rotorLeaf.offsetWidth;
        me.rotorLeaf.classList.add("flipped");
      }


      /*if ( me.prevClockValue ) {
        // update with transition
        setTimeout(rotorTopFlip.bind(this), 500);
        setTimeout(rotorLeafRearFlip.bind(this), 500);
      } else */{
        // first call to immedeate update
        //rotorTopFlip.call(this);
        //rotorLeafRearFlip.call(this);
      }
      
      this.prevClockValue = text;
    }
    transitionend( e: TransitionEvent ) {
      console.log("transitioned...");
      var me = this;
      me.rotorLeaf.classList.remove("flipped");
      me.rotorLeafFront.textContent = me.rotorTop.textContent;
      me.rotorLeafRear.textContent = me.rotorTop.textContent;
      me.rotorBottom.textContent = me.rotorLeafRear.textContent;

    }
  };
  export class Delimiter {
    element: HTMLElement;
    elementLabel: HTMLElement;
    label: string | null;

    constructor( label: string | null, labelAt: string | null  ){
      this.label = label;

      var element = this.element = document.createElement("div");
      this.element.classList.add("rotor-group");
      if( labelAt )
        this.element.classList.add(labelAt as string);

      this.initElement();
    }
    initElement(){

      this.element.classList.add("delimiter");
      var del = document.createElement("div");
      del.innerHTML = this.label as string;
      this.element.appendChild(del);
    }
  }
  export class RotorGroup extends Delimiter {
    constructor(numRotors: number, label: string | null, labelAt : string | null ){
      super(label, labelAt );

      // rotors
      this.rotors = [];
      for( var i=0; i< numRotors; i++ ){
        var r = new Rotor();
        this.rotors.push(r);
      }
      this.rotors.forEach(r => this.element.appendChild(r.element));
    }
    initElement(){
      if( this.label /*&& (labelAt == "top" || labelAt == "bottom")*/ ) {
        this.elementLabel = document.createElement("div");
        this.elementLabel.classList.add("rotor-group-heading");

        this.element.appendChild(this.elementLabel);
      }
      if( this.elementLabel ){
        this.elementLabel.innerHTML = this.label as string;
      }
    }

    rotors: Array<Rotor>;
    clockValue: number;
    updateClockValue( v : number | null = null){
      v = v || this.clockValue;
      var nnn = this.pad(v,2);
      var index = 0;
      var rr = this.rotors.length;
      var p: string; var ri: number = 0; var i: number = 0;
      if( rr < nnn.length ){
        p = nnn.substring(0, nnn.length - rr + 1);
        i = nnn.length - rr;
      }
      else
        p = nnn[0];
      for( ; i < nnn.length; p = nnn[++i] ){
        this.rotors[ri++].setText(p);
      }

    }
    /**
     * @name pad
     * @description Prefix a number with zeroes
     * @author PButcher
     * @param {string} n - Number to pad
     * @param {number} len - Desired length of number
     **/
    private pad(n, len) : string {
      n = n.toString();
      return n.length < len ? this.pad("0" + n, len) : n;
    }
  }

}

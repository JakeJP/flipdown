document.addEventListener('DOMContentLoaded', () => {

  var samples = [
    {
      title: "2 days (normal)",
      uts: (new Date().getTime() / 1000) + (86400 * 2) + 1,
      class: "responsive",
      opts: { theme: 'light'}
    },
    {
      title: "4 digits for day",
      uts: (new Date().getTime() / 1000) + (86400 * 101) + 1,
      opts: { theme: 'dark', headingsAt: 'right', delimiters: false, headings: ['days','h', 'm', 's']}
    },    
    {
      title: "no days",
      uts: (new Date().getTime() / 1000) + (86400 * 1234) + 1,
      opts: { theme: 'green' }
    },
    {
      title: "no days",
      uts: (new Date().getTime() / 1000) + (86400 * 0.4) + 1,
      opts: { theme: 'yellow' , headingsAt:'bottom'}
    },
    {
      title: "no headings",
      uts: (new Date().getTime() / 1000) + (86400 * 0.4) + 1,
      opts: {theme: 'red', headings: false }
    },
    {
      title: "no days no hour",
      style: "font-size: smaller; ",
      uts: (new Date().getTime() / 1000) + (60) + 1,
      opts: {
        theme: 'light', 
        headings: false,
        tick: function(remaining, now){
          if( Math.floor(remaining) == 20)
            this.setTheme('green');
          else if( Math.floor(remaining) == 10)
            this.setTheme('yellow');
          else if( Math.floor(remaining) == 5)
            this.setTheme('yellow');
        },
        ended: function(tick){
          var fd = this;
          fd.setTheme('red');
        }
      }
    },
    {
      title: "localized headings",
      uts: (new Date().getTime() / 1000) + (86400 * 2) + 1,
      opts: { theme: 'dark', headingsAt: 'right', delimiters: false, headings: ["日", "時", "分", "秒"]}
    },

  ];

  var flipdowns = [];
  // Set up FlipDown
  var container = document.getElementById("samplecontainer");
  samples.forEach( function(sample, i){
    var div = document.createElement("div");
    var id = 'flipdown' + i;
    div.id = id;
    div.classList.add('flipdown');
    container.appendChild(div);
    var flipdown = new FlipDown(sample.uts, id, sample.opts );
    if( sample.style )
      flipdown.element.style = sample.style;
    if( sample.class )
      flipdown.element.classList.add(sample.class);
    flipdown
      // Start the countdown
      .start()
      //.stop()
      // Do something when the countdown ends
      .ifEnded(() => {
        console.log('The countdown has ended!');
      });
    flipdowns.push(flipdown);
  });


  // Toggle theme
  var interval = setInterval(() => {
    let body = document.body;
    body.classList.toggle('light-theme');
  }, 5000);
  // Show version number
  var ver = document.getElementById('ver');
  ver.innerHTML = FlipDown.version;
});

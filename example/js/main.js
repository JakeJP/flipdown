document.addEventListener('DOMContentLoaded', () => {

  var samples = [
    {
      id: "flipdown1", title: "2 days (normal)",
      uts: (new Date().getTime() / 1000) + (86400 * 2) + 1,
      opts: { theme: 'light'}
    },
    { id: "flipdown2", title: "no days",
      uts: (new Date().getTime() / 1000) + (86400 * 0.4) + 1,
      opts: { theme: 'dark'}
    },
    { id: "flipdown3", title: "no days no hour",
    uts: (new Date().getTime() / 1000) + (10) + 1
    },
    { id: "flipdown4", title: "4 digits for day",
      uts: (new Date().getTime() / 1000) + (86400 * 1234) + 1
    },    
    { id: "flipdown5", title: "localized headings",
    uts: (new Date().getTime() / 1000) + (86400 * 2) + 1,
    opts: { headings: ["日", "時", "分", "秒"] }
    },
    { id: "flipdown6", title: "no headings",
      uts: (new Date().getTime() / 1000) + (86400 * 0.4) + 1,
      opts: { headings: null }
    },
  ];
  // Unix timestamp (in seconds) to count down to
  var twoDaysFromNow = (new Date().getTime() / 1000) + (86400 * 0.4) + 1;

  // Set up FlipDown
  samples.forEach( function(sample){
    var flipdown = new FlipDown(sample.uts, sample.id, sample.opts )
      // Start the countdown
      .start()
      //.stop()
      // Do something when the countdown ends
      .ifEnded(() => {
        console.log('The countdown has ended!');
      });
  });


  // Toggle theme
  var interval = setInterval(() => {
    let body = document.body;
    body.classList.toggle('light-theme');
    document.querySelectorAll('.flipdown').forEach(function(el){
      el.classList.toggle('flipdown__theme-dark');
      el.classList.toggle('flipdown__theme-light');
    });
  }, 5000);
  // Show version number
  var ver = document.getElementById('ver');
  ver.innerHTML = FlipDown.version;
});

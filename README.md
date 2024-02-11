***This project a forked project from [https://github.com/PButcher/flipdown](https://github.com/PButcher/flipdown)***

# FlipDown.js Jake's edition 2024

⏰ A lightweight and performant flip styled countdown clock.

This project was created by [PButcher](https://github.com/PButcher/flipdown).
I rewrote the source code in TypeScript and LESS css for some extensions which are listed in the feature list.

<span style="text-align:center;display:block;width:100%;"><img src="example/images/screenshot.png" style="width:75%" title="Example of FlipDown" style="width: 500px;text-align:center"/></span>


## Features

- 💡 Lightweight - No jQuery! <11KB minified bundle
- ⚡ Performant - Animations powered by CSS transitions
- 📱 Responsive - Works great on screens of all sizes
- 🎨 Themeable - Choose from built-in themes, or add your own
- 🌍 i18n - Customisable headings for your language

### In addition to the original version, Jake's edition features the following

- more Responsive - restructured using Flexbox css so the size fits and stretches along the drawing container.
- more digits on **Days** rotor.
- auto hide preceding zeros.
- on/off heading labels.
- more lightweight  &lt; 9KB

Respecting the original edition of FlipDown, usage of Javascript class and HTML structure are preserved as much as possible.

## Example

Example live at: https://jakejp.github.io/flipdown/example/

## Basic Usage

For basic usage, FlipDown takes a unix timestamp (in seconds) as an argument.

```javascript
new FlipDown(1538137672).start();
```

Include the [CSS and JS](https://github.com/PButcher/flipdown/tree/master/dist) in `<head>` and include the following line in your HTML.

```html
<div id="flipdown" class="flipdown"></div>
```

See a full example [here](https://github.com/JakeJP/flipdown/tree/master/example).

## Multiple Instances

To use multiple instances of FlipDown on the same page, specify a DOM element ID as the second argument in FlipDown's constructor:

```javascript
new FlipDown(1588017373, "registerBy").start();
new FlipDown(1593561600, "eventStart").start();
```

```html
<div id="registerBy" class="flipdown"></div>
<div id="eventStart" class="flipdown"></div>
```

## Themes

FlipDown comes with 2 themes as standard:

- dark [default]
- light
- green
- yellow
- red

To change the theme, you can supply the `theme` property in the `opt` object in the constructor with the theme name as a string:

```javascript
{
  theme: "light";
}
```

For example, to instantiate FlipDown using the light theme instead:

```javascript
new FlipDown(1538137672, {
  theme: "light",
}).start();
```

### Custom Themes

Custom themes can be added by adding a new stylesheet using the FlipDown [theme template](https://github.com/PButcher/flipdown/blob/master/src/flipdown.css#L3-L34).

FlipDown themes must have the class name prefix of: `.flipdown__theme-` followed by the name of your theme. For example, the standard theme class names are:

- `.flipdown__theme-dark`
- `.flipdown__theme-light`

You can then load your theme by specifying the `theme` property in the `opt` object of the constructor (see [Themes](#Themes)).

## Headings

You can add your own rotor group headings by passing an array as part of the `opt` object. Bear in mind this won't change the functionality of the rotors (eg: the 'days' rotor won't magically start counting months because you passed it 'Months' as a heading).

Suggested use is for i18n. Usage as follows:

```javascript
new FlipDown(1538137672, {
  headings: ["Nap", "Óra", "Perc", "Másodperc"],
}).start();
```

Note that headings will default to English if not provided: `["Days", "Hours", "Minutes", "Seconds"]`

Header labels can be turned off by passing null to `headings`.

```javascript
new FlipDown(1538137672, { headings: null }).start();
```

## Callbacks

### tick

`tick` specifies a callback function, which is called every time FlipDown flips.

### ended

`ended` is called when FlipDown reaches the end of countdown. (Same as IfEnded )

```javascript
new FlipDown(1538137672, {
  tick: function(){

  },
  ended: function(){

  }
}).start();
```

## API

### `FlipDown.prototype.constructor(uts, [el], [opts])`

Create a new FlipDown instance.

#### Parameters

##### `uts`

Type: _number_

The unix timestamp to count down to (in seconds).

##### `[el]`

**Optional**  
Type: _string_ (default: `flipdown`)

The DOM element ID to attach this FlipDown instance to. Defaults to `flipdown`.

##### `[opts]`

**Optional**  
Type: _object_ (default: `{}`)

Optionally specify additional configuration settings. Currently supported settings include:

- [`theme`](#Themes)
- [`headings`](#Headings)
- [`tick`](#tick)
- [`ended`](#ended)

### `FlipDown.prototype.start()`

Start the countdown.

### `FlipDown.prototype.ifEnded(callback)`

Call a function once the countdown has ended.

#### Parameters

##### `callback`

Type: _function_

Function to execute once the countdown has ended.

#### Example

```javascript
var flipdown = new FlipDown(1538137672)

  // Start the countdown
  .start()

  // Do something when the countdown ends
  .ifEnded(() => {
    console.log("The countdown has ended!");
  });
```
## How to build

Build configuration is not included in the project. But the original source is just 2 files:

- **flipdown.ts** - TypeScript source code should be compiled in `.js` then `.min.js` by minifier
- **flipdown.less** - LESS CSS file should be compiled in `.css` and `.min.css`  by minifier

## Acknowledgements

Special thanks to the original project.

- [@PButcker](https://github.com/PButcher) for the orignal project which my project is based on.

Thanks to the following people for their suggestions/fixes:

- [@chuckbergeron](https://github.com/chuckbergeron) for his help with making FlipDown responsive.
- [@vasiliki-b](https://github.com/vasiliki-b) for spotting and fixing the Safari backface-visibility issue.
- [@joeinnes](https://github.com/joeinnes) for adding i18n to rotor group headings.

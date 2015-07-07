# smoooth
Smooth is a small JavaScript module based on [VirtualScroll](http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/) to create smooth scrolling and parallax effects on scroll.

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

# Getting Started

### Clone the repository

`git clone https://github.com/BaptisteBriel/smooth.git`

### Using npm

`npm install smooth-scrolling`

[![NPM](https://nodei.co/npm/smooth-scrolling.png)](https://www.npmjs.com/package/smooth-scrolling)

### Setup

First, you'll need some simple HTML:

```html
<div class="section vs-section">
  <div class="vs-transform" data-speed="0.2"></div>
  <div class="vs-transform" data-speed="0.4"></div>
  <div class="vs-transform" data-speed="0.6"></div>
  <div class="vs-transform" data-speed="0.8"></div>
  <div class="vs-transform" data-speed="1"></div>
</div>
```

And some basic CSS:

```css
body{
  overflow: hidden;
}

.section{
  position: absolute;
  
  /* if it's a vertical scrolling */
  width: 100%; 
  height: auto;
  
  /* if it's a horizontal scrolling */
  width: auto; 
  height: 100%;
}
```

If you want a custom scrollbar, you'll need additional CSS.

```css
.vs-scrollbar{
  display: block;
  position: absolute;
}
.vs-scrollbar.vs-vertical{
  top: 0; right: 0; bottom: 0;
  width: 5px; height: 100%;
}
.vs-scrollbar.vs-horizontal{
  bottom: 0; left: 0; right: 0;
  width: 100%; height: 5px;
}
.vs-scrollbar .vs-scrolldrag{
  width: 100%;
  height: auto;
  border-radius: 10px;
}
```

#### Normal usage

If you're not using the npm version of smooth-scrolling, `smooth.js` is located under src/.
VirtualScroll (`vs.js`) and the requestAnimationFrame polyfill (`rAF.js`) are located under lib/

*This is the standard source code which doesn't `require()` modules so you can use it normally without npm and browserify.*

```html
<script src="lib/rAF.js"></script>
<script src="lib/vs.js"></script>
<script src="src/smooth.js"></script>
```

The requestAnimationFrame polyfill was taken from [here](http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/).

#### With browserify

If you're using smooth-scrolling on npm, you'll just need the requestAnimationFrame polyfill located under lib/

```html
<script src="lib/rAF.js"></script>
<script src="src/build.min.js"></script>
```

### Usage

Now to the JavaScript part;  
To launch a new smooth scroll, just use the Smooth object like this:

```javascript
// get our section
var section = document.querySelector('.vs-section');
// get our extra divs
var divs = document.querySelectorAll('.vs-transform');

// initialize the object w/ some parameters
var smooth = new Smooth({
  direction: 'vertical',
  section: section,
  ease: 0.1,
  scrollbar: { 
    active: true,
    bg: '#FFF',
    main: '#c5c5c5'
  },
  els: divs // optional
});
// kickoff the smooth scroll
smooth.init();
```

As you can see, there's a bunch of parameters:

- `direction` : 'vertical' or 'horizontal' scrolling.
- `section` : the global container of your page; will have CSS transform by default on scroll.
- `ease` : the easing value (generally between 0 and 1) - 1 will be faster.
- `scrollbar` : the scrollbar settings
- `els` : DOM list. If it's not specified (no parallax), the transform is applied to the section

Later, you might want to stop the events and requestAnimationFrame by doing:

```javascript
smooth.destroy();
```

### Methods

There's two 'scrollTo' methods:  

With HTML:  

```html
<!-- this is a default box -->
<div class="vs-transform js-referer" data-speed="0.2"></div>

<!-- now we create an anchor (could be a nav menu) -->
<span class="vs-scrollto" data-scroll="js-referer">text</span>
<!-- note that the 'data-scroll' has to contains -->
<!-- one of the same classes as the box you want to scroll to -->
```

Or JavaScript:  

```javascript
// scrollTo with a fixed value (usefull for simple scrollTop)
smooth.scrollTo(0);

// scrollTo a specific div
var div = document.querySelector('.js-referer');
var offset = div.getBoundingClientRect().top;

// this should work :)
smooth.scrollTo(offset);
```

## Further understanding

If you didn't already read [the tutorial](http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/), I highly recommend it.
Smooth.js is basically what's explained on the blog post. I just needed a simple script to get things done without having to write lots of code every time I wanted to use this technique.

## License

MIT, see [LICENSE.md](https://github.com/BaptisteBriel/smooth/blob/master/LICENSE).

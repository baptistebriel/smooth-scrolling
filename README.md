# smooth

Smooth is a small JavaScript module based on [VirtualScroll](http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/) to create smooth scrolling and parallax effects on scroll.
It works both with fake scrollbars and native scrolling.

### Usage

`npm install smooth-scrolling`

```javascript
import Smooth from 'smooth-scrolling'

const section = document.querySelector('.vs-section')
const smooth = new Smooth({
  native: true,
  section: section,
  ease: 0.1
})

smooth.init()
```

### Options

- `listener`: on-scroll events listener & parent container for all elements
- `direction` : vertical or horizontal scrolling behavior
- `native`: use the default scrollbar
- `section` : the element to transform
- `ease` : the easing value (usually between 0 and 1)
- `vs` : you can pass some option for virtuall-scroll: limitInertia, mouseMultiplier, etc
- `preload` : if set to false, there will be no resize function called after all images loaded
- `noscrollbar` : if using virtual-scroll and set to true, it will not build a custom scrollbar
- `callback`: function called on requestAnimationFrame

### Methods

#### `smooth.init()`

Will add all event listeners and DOM elements.

#### `smooth.on()`

Will listen to either window scroll event (if native), otherwise VirtualScroll

#### `smooth.off()`

Will stop listening to onscroll/wheel events.

#### `smooth.destroy()`

Will remove all event listeners and DOM elements.

#### `smooth.scrollTo(offset)`

Basic scrollTo function.

### Extends Smooth

```javascript
import Smooth from 'smooth-scrolling'

class Custom extends Smooth {
  
  constructor(opt = {}) {
    super(opt)
    this.dom.section = opt.section
    this.dom.opacity = opt.opacity
  }
  
  run() {
    super.run()
    
    const current = Math.round(Math.abs(this.vars.current))
    const opacity = Math.max(0, Math.min(1 - current / (this.vars.height * .5), 1))
    
    this.dom.opacity.style.opacity = opacity.toFixed(2)
    this.dom.section.style[this.prefix] = this.getTransform(-this.vars.current.toFixed(2))
  }

  resize() {
    this.vars.bounding = this.dom.section.getBoundingClientRect().height - this.vars.height
    super.resize()
  }
}

export default Custom
```

```javascript
// ...and later on
import Custom from './custom-smooth-scrolling'

const section = document.querySelector('.vs-section')
const opacity = document.querySelector('.vs-opacity')

const smooth = new Custom({
  section: section,
  opacity: opacity,
  ease: 0.1
})

smooth.init()
```

### Development

`git clone git@github.com:baptistebriel/smooth-scrolling.git`

`cd smooth-scrolling/ && npm i && npm run dev`

You can use `[http-server](https://www.npmjs.com/package/http-server)` or [MAMP](https://www.mamp.info) to preview the demos.

### Demos

`npm run demo-parallax`

`npm run demo-parallax-page`

`npm run demo-horizontal`

`npm run demo-native-horizontal`

`npm run demo-opacity`

`npm run demo-scale`

`npm run demo-split`

`npm run demo-performances`

### Examples

- [etq.store](http://etq.store)
- [femmefatale.paris](http://femmefatale.paris)
- [buildin.amsterdam](http://buildin.amsterdam)
- [romainpsd.com](https://romainpsd.com)
- [flavinsky.com](http://flavinsky.com)
- [alisharaf.com](http://alisharaf.com)
- [bbriel.me](http://bbriel.me)
- [studiochevojon.com](http://studiochevojon.com)
- [andeinerseite.video](http://andeinerseite.video)
- [eginstill.com](http://eginstill.com)
- [blackballoon.fr](http://www.blackballoon.fr)
- & more to come!

## Further understanding

If you didn't already read [the tutorial](http://www.everyday3d.com/blog/index.php/2014/08/18/smooth-scrolling-with-virtualscroll/), I highly recommend it.
Smooth.js is basically what's explained on the blog post. I just needed a simple script to get things done without having to write lots of code every time I wanted to use this technique.

## License

MIT, see [LICENSE.md](https://github.com/BaptisteBriel/smooth/blob/master/LICENSE).

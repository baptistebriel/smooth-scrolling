import classes from 'dom-classes'
import create from 'dom-create-element'
import prefix from 'prefix'
import vs from 'virtual-scroll'
import event from 'dom-events'

export default class Smooth {

  constructor(opt = {}) {
    this.createBound()
    this.options = opt
    this.prefix = prefix('transform')
    this.rAF = undefined
    // It seems that under heavy load, Firefox will still call the RAF callback even though the RAF has been canceled
    // To prevent that we set a flag to prevent any callback to be executed when RAF is removed
    this.isRAFCanceled = false
    const constructorName = this.constructor.name ? this.constructor.name : 'Smooth'
    this.extends = typeof opt.extends === 'undefined' ? this.constructor !== Smooth : opt.extends
    this.callback = this.options.callback || null
    this.vars = {
      direction: this.options.direction || 'vertical',
      native: this.options.native || false,
      ease: this.options.ease || 0.075,
      preload: this.options.preload || false,
      current: 0,
      last: 0,
      target: 0,
      height: window.innerHeight,
      width: window.innerWidth,
      bounding: 0,
      timer: null,
      ticking: false
    }
    this.vs = this.vars.native ? null : new vs({
      limitInertia: this.options.vs && this.options.vs.limitInertia || false,
      mouseMultiplier: this.options.vs && this.options.vs.mouseMultiplier || 1,
      touchMultiplier: this.options.vs && this.options.vs.touchMultiplier || 1.5,
      firefoxMultiplier: this.options.vs && this.options.vs.firefoxMultiplier || 30,
      preventTouch: this.options.vs && this.options.vs.preventTouch || true
    })
    this.dom = {
      listener: this.options.listener || document.body,
      section: this.options.section || document.querySelector('.vs-section') || null,
      scrollbar: this.vars.native || this.options.noscrollbar ? null : {
        state: {
          clicked: false,
          x: 0
        },
        el: create({ selector: 'div', styles: `vs-scrollbar vs-${this.vars.direction} vs-scrollbar-${constructorName.toLowerCase()}` }),
        drag: {
          el: create({ selector: 'div', styles: 'vs-scrolldrag' }),
          delta: 0,
          height: 50
        }
      }
    }
  }

  createBound() {
    ['run', 'calc', 'debounce', 'resize', 'mouseUp', 'mouseDown', 'mouseMove', 'calcScroll', 'scrollTo']
    .forEach((fn) => this[fn] = this[fn].bind(this));
  }

  init() {
    this.addClasses()
    this.vars.preload && this.preloadImages()
    this.vars.native ? this.addFakeScrollHeight() : !this.options.noscrollbar && this.addFakeScrollBar()
    this.addEvents()
    this.resize()
  }

  addClasses() {
    const type = this.vars.native ? 'native' : 'virtual'
    const direction = this.vars.direction === 'vertical' ? 'y' : 'x'
    classes.add(this.dom.listener, `is-${type}-scroll`)
    classes.add(this.dom.listener, `${direction}-scroll`)
  }

  preloadImages() {
    const images = Array.prototype.slice.call(this.dom.listener.querySelectorAll('img'), 0)
    images.forEach((image) => {
      const img = document.createElement('img')
      event.once(img, 'load', () => {
        images.splice(images.indexOf(image), 1)
        images.length === 0 && this.resize()
      })
      img.src = image.getAttribute('src')
    })
  }

  calc(e) {
    const delta = this.vars.direction == 'horizontal' ? e.deltaX : e.deltaY
    this.vars.target += delta * -1
    this.clampTarget()
  }

  debounce() {
    const win = this.dom.listener === document.body
    this.vars.target = this.vars.direction === 'vertical' ? win ? window.scrollY || window.pageYOffset : this.dom.listener.scrollTop : win ? window.scrollX || window.pageXOffset : this.dom.listener.scrollLeft
    clearTimeout(this.vars.timer)
    if(!this.vars.ticking) {
      this.vars.ticking = true;
      classes.add(this.dom.listener, 'is-scrolling')
    }
    this.vars.timer = setTimeout(() => {
      this.vars.ticking = false
      classes.remove(this.dom.listener, 'is-scrolling')
    }, 200)
  }

  run() {
    if (this.isRAFCanceled) return
    this.vars.current += (this.vars.target - this.vars.current) * this.vars.ease
    this.vars.current < .1 && (this.vars.current = 0)
    this.requestAnimationFrame()
    if(!this.extends){
      this.dom.section.style[this.prefix] = this.getTransform(-this.vars.current.toFixed(2))
    }
    if(!this.vars.native && !this.options.noscrollbar) {
      const size = this.dom.scrollbar.drag.height
      const bounds = this.vars.direction === 'vertical' ? this.vars.height : this.vars.width
      const value = (Math.abs(this.vars.current) / (this.vars.bounding / (bounds - size))) + (size / .5) - size
      const clamp = Math.max(0, Math.min(value-size, value+size))
      this.dom.scrollbar.drag.el.style[this.prefix] = this.getTransform(clamp.toFixed(2))
    }
    if (this.callback && this.vars.current !== this.vars.last) {
      this.callback(this.vars.current)
    }
    this.vars.last = this.vars.current
  }

  getTransform(value) {
    return this.vars.direction === 'vertical' ? `translate3d(0,${value}px,0)` : `translate3d(${value}px,0,0)`
  }

  on(requestAnimationFrame = true) {
    if (this.isRAFCanceled) {
      this.isRAFCanceled = false
    }
    const node = this.dom.listener === document.body ? window : this.dom.listener
    this.vars.native ? event.on(node, 'scroll', this.debounce) : (this.vs && this.vs.on(this.calc))
    requestAnimationFrame && this.requestAnimationFrame()
  }

  off(cancelAnimationFrame = true) {
    const node = this.dom.listener === document.body ? window : this.dom.listener
    this.vars.native ? event.off(node, 'scroll', this.debounce) : (this.vs && this.vs.off(this.calc))
    cancelAnimationFrame && this.cancelAnimationFrame()
  }

  requestAnimationFrame() {
    this.rAF = requestAnimationFrame(this.run)
  }

  cancelAnimationFrame() {
    this.isRAFCanceled = true
    cancelAnimationFrame(this.rAF)
  }

  addEvents() {
    this.on()
    event.on(window, 'resize', this.resize)
  }

  removeEvents() {
    this.off()
    event.off(window, 'resize', this.resize)
  }

  addFakeScrollBar() {
    this.dom.listener.appendChild(this.dom.scrollbar.el)
    this.dom.scrollbar.el.appendChild(this.dom.scrollbar.drag.el)
    event.on(this.dom.scrollbar.el, 'click', this.calcScroll)
    event.on(this.dom.scrollbar.el, 'mousedown', this.mouseDown)
    event.on(document, 'mousemove', this.mouseMove)
    event.on(document, 'mouseup', this.mouseUp)
  }

  removeFakeScrollBar() {
    event.off(this.dom.scrollbar.el, 'click', this.calcScroll)
    event.off(this.dom.scrollbar.el, 'mousedown', this.mouseDown)
    event.off(document, 'mousemove', this.mouseMove)
    event.off(document, 'mouseup', this.mouseUp)
    this.dom.listener.removeChild(this.dom.scrollbar.el)
  }

  mouseDown(e) {
    e.preventDefault()
    e.which == 1 && (this.dom.scrollbar.state.clicked = true)
  }

  mouseUp(e) {
    this.dom.scrollbar.state.clicked = false
    classes.remove(this.dom.listener, 'is-dragging')
  }

  mouseMove(e) {
    this.dom.scrollbar.state.clicked && this.calcScroll(e)
  }

  addFakeScrollHeight() {
    this.dom.scroll = create({
      selector: 'div',
      styles: 'vs-scroll-view'
    })
    this.dom.listener.appendChild(this.dom.scroll)
  }

  removeFakeScrollHeight() {
    this.dom.listener.removeChild(this.dom.scroll)
  }

  calcScroll(e) {
    const client = this.vars.direction == 'vertical' ? e.clientY : e.clientX
    const bounds = this.vars.direction == 'vertical' ? this.vars.height : this.vars.width
    const delta = client * (this.vars.bounding / bounds)
    classes.add(this.dom.listener, 'is-dragging')
    this.vars.target = delta
    this.clampTarget()
    this.dom.scrollbar && (this.dom.scrollbar.drag.delta = this.vars.target)
  }

  scrollTo(offset) {
    if(this.vars.native) {
      this.vars.direction == 'vertical' ? window.scrollTo(0, offset) : window.scrollTo(offset, 0)
    } else {
      this.vars.target = offset
      this.clampTarget()
    }
  }

  resize() {
    const prop = this.vars.direction === 'vertical' ? 'height' : 'width';
    this.vars.height = window.innerHeight
    this.vars.width = window.innerWidth
    if(!this.extends) {
      const bounding = this.dom.section.getBoundingClientRect()
      this.vars.bounding = this.vars.direction === 'vertical' ? bounding.height - (this.vars.native ? 0 : this.vars.height) : bounding.right - (this.vars.native ? 0 : this.vars.width)
    }
    if(!this.vars.native && !this.options.noscrollbar) {
      this.dom.scrollbar.drag.height = this.vars.height * (this.vars.height / (this.vars.bounding + this.vars.height))
      this.dom.scrollbar.drag.el.style[prop] = `${this.dom.scrollbar.drag.height}px`
    } else if(this.vars.native) {
      this.dom.scroll.style[prop] = `${this.vars.bounding}px`
    }
    !this.vars.native && this.clampTarget();
  }

  clampTarget() {
    this.vars.target = Math.round(Math.max(0, Math.min(this.vars.target, this.vars.bounding)))
  }

  destroy() {
    if(this.vars.native) {
      classes.remove(this.dom.listener, 'is-native-scroll')
      this.removeFakeScrollHeight()
    } else {
      classes.remove(this.dom.listener, 'is-virtual-scroll')
      !this.options.noscrollbar && this.removeFakeScrollBar()
    }
    this.vars.direction === 'vertical' ? classes.remove(this.dom.listener, 'y-scroll') : classes.remove(this.dom.listener, 'x-scroll')
    this.vars.current = 0
    this.vs && (this.vs.destroy(), this.vs = null)
    this.removeEvents()
  }
}

window.Smooth = Smooth
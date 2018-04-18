import Smooth from '../../index'
import css from 'dom-css'

class Split extends Smooth {

  constructor(opt) {
    super(opt)
    this.createExtraBound()
    this.sections = null
    this.dom.sections = Array.prototype.slice.call(opt.sections, 0)
  }

  createExtraBound() {
    ['getCache', 'inViewport']
    .forEach((fn) => this[fn] = this[fn].bind(this))
  }

  resize() {
    this.dom.sections.forEach((el, index) => css(el, {
      'display': 'block',
      'position': 'relative',
      'top': 0,
      'transform': 'none'
    }))
    this.vars.bounding = this.dom.sections[this.dom.sections.length - 1].getBoundingClientRect().bottom - (this.vars.native ? 0 : this.vars.height)
    css(this.dom.section, 'height', this.vars.bounding)
    this.getCache()
    this.dom.sections.forEach((el, index) => css(el, {
      'position': 'fixed',
      'width': '100%',
      'top': this.sections[index].top
    }))
    super.resize()
  }

  getCache() {
    this.sections = []
    this.dom.sections.forEach((el, index) => {
      const bounding = el.getBoundingClientRect();
      const bounds = {
        el: el,
        state: true,
        top: bounding.top,
        bottom: bounding.bottom,
        speed: '-1'
      }
      this.sections.push(bounds)
    })
  }

  run() {
    this.dom.sections.forEach(this.inViewport)
    super.run()
  }

  inViewport(el, index) {
    if(!this.sections) return
    const cache = this.sections[index]
    const current = this.vars.current
    const transform = current * cache.speed
    const top = Math.round(cache.top + transform)
    const bottom = Math.round(cache.bottom + transform)
    const inview = bottom > 0 && top < this.vars.height
    if(inview) {
      // !cache.state && (this.dom.section.appendChild(cache.el), cache.state = true);
      el.style.display = 'block'
      el.style[this.prefix] = this.getTransform(transform)
    } else {
      el.style.display = 'none'
      el.style[this.prefix] = 'none'
      // cache.state && cache.el.parentNode && (cache.el.parentNode.removeChild(cache.el), cache.state = false);
    }
  }
}

export default Split
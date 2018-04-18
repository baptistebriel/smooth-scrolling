import Smooth from '../../index'

class Custom extends Smooth {
  
  constructor(opt) {
    super(opt)
    this.dom.section = opt.section
    this.dom.opacity = opt.opacity
  }
  
  init() {
    super.init()
  }
  
  run() {
    super.run()
    const current = Math.round(Math.abs(this.vars.current))
    const opacity = Math.max(0, Math.min(1 - current / (this.vars.height * .5), 1))
    this.dom.opacity.style.opacity = opacity.toFixed(2);
    this.dom.section.style[this.prefix] = this.getTransform(-this.vars.current.toFixed(2))
  }

  resize() {
    this.vars.bounding = this.dom.section.getBoundingClientRect().height - this.vars.height
    super.resize()
  }
}

export default Custom
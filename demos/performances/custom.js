import Smooth from '../../index'

class Custom extends Smooth {
  
  constructor(opt) {
    super(opt)
    this.perfs = {
      now: null,
      last: null
    }
    this.dom.section = opt.section
  }
  
  init() {    
    super.init();
  }
  
  run() {
    this.perfs.now = window.performance.now()
    super.run()
    this.dom.section.style[this.prefix] = this.getTransform(-this.vars.current.toFixed(2))
    console.log(this.perfs.now - this.perfs.last)
    this.perfs.last = this.perfs.now
  }
  
  resize() {
    this.vars.bounding = this.dom.section.getBoundingClientRect().height - this.vars.height
    super.resize()
  }
}

export default Custom
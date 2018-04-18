import Smooth from '../../index'

class Custom extends Smooth {
  
  constructor(opt) {
    super(opt)
    this.dom.img = opt.img
  }
  
  init() {
    super.init()
  }
  
  run() {
    super.run()
    const current = Math.round(Math.abs(this.vars.current));
    const scale = Math.max(0.8, Math.min(0.8 + current / window.innerHeight * 1.5, 10))
    this.dom.img.style[this.prefix] = `scale3d(${scale},${scale},${scale})`;
  }

  resize() {
    this.vars.bounding = window.innerHeight * 1.5
    super.resize()
  }
}

export default Custom
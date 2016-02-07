import performance from 'perfnow'
import classes from 'dom-classes'
import create from 'dom-create-element'
import css from 'dom-css'
import prefix from 'prefix'
import vs from 'virtual-scroll'
import {on, off} from 'dom-event'

class Smooth {
    
    constructor(opt = {}) {
        
        this.createBound()

        this.prefix = prefix('transform')
        
        // TODO: detect if is an extension of Smooth
        // return false if is a direct instance of Smooth
        this.extends = opt.extends || false
        
        this.perfs = {
            now: null,
            last: null
        }
        
        this.vars = {
            direction: opt.direction || 'vertical',
            native: opt.native || false,
            ease: opt.ease || 0.075,
            preload: opt.preload || true,
            current: 0,
            target: 0,
            height: 0,
            bounding: 0,
            timer: null,
            ticking: false
        }
        
        this.vs = this.vars.native ? null : new vs({
            limitInertia: opt.vs && opt.vs.limitInertia || false,
            mouseMultiplier: opt.vs && opt.vs.mouseMultiplier || 1,
            touchMultiplier: opt.vs && opt.vs.touchMultiplier || 1.5,
            firefoxMultiplier: opt.vs && opt.vs.firefoxMultiplier || 30,
            preventTouch: opt.vs && opt.vs.preventTouch || true
        })
        
        this.dom = {
            listener: opt.listener || document.body,
            section: opt.section || document.querySelector('.vs-section') || null,
            scrollbar: this.vars.native ? null : {
                state: {
                    clicked: false,
                    x: 0
                },
                el: create({ selector: 'div', styles: `vs-scrollbar vs-${this.vars.direction}` }),
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

        this.vars.preload && this.preloadImages()
        this.vars.native && this.addFakeScrollHeight()
        
        this.addEvents();
        
        !this.vars.preload && this.resize()
        !this.vars.native && this.addFakeScrollBar()
    }

    preloadImages() {

        const images = Array.prototype.slice.call(this.dom.listener.querySelectorAll('img'), 0)

        images.forEach((image) => {
            
            const img = new Image();
            
            img.onload = (el) => {

                images.splice(images.indexOf(image), 1)
                images.length === 0 && this.resize()
            }

            img.src = image.getAttribute('src')
        })
    }
    
    calc(e) {
        
        const delta = this.direction == 'horizontal' ? e.deltaX : e.deltaY
        
        this.vars.target += delta * -1
        this.vars.target = Math.max(0, Math.min(this.vars.target, this.vars.bounding))
    }
    
    debounce() {

        this.vars.target = this.vars.direction === 'vertical' ? window.scrollY || window.pageYOffset : window.scrollX || window.pageXOffset
        
        this.addScrollingClass()
    }
    
    addScrollingClass() {

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
        
        this.vars.current += (this.vars.target - this.vars.current) * this.vars.ease
        this.vars.current < .1 && (this.vars.current = 0)
        
        !this.extends && (this.dom.section.style[this.prefix] = this.getTransform(-this.vars.current.toFixed(2)))
        !this.vars.native && this.transformScrollbar()
        
        this.rAF = requestAnimationFrame(this.run)
    }
    
    transformScrollbar() {

        const size = this.dom.scrollbar.drag.height
        const bounds = this.vars.direction === 'vertical' ? this.vars.height : this.vars.width
        const value = (Math.abs(this.vars.current) / (this.vars.bounding / (bounds - size))) + (size / .5) - size
        const clamp = Math.max(0, Math.min(value-size, value+size))
        
        this.dom.scrollbar.drag.el.style[this.prefix] = this.getTransform(clamp.toFixed(2))
    }
    
    getTransform(value) {
        
        return this.direction === 'vertical' ? 'translate3d(0,' + value + 'px,0)' : 'translate3d(0,' + value + 'px,0)'
    }

    addEvents() {

        this.vars.native ? on(window, 'scroll', this.debounce) : this.vs.on(this.calc)
        
        on(window, 'resize', this.resize)
        
        this.rAF = requestAnimationFrame(this.run)
    }
    
    removeEvents() {
        
        this.vars.native ? event.off(window, 'scroll', this.debounce) : (this.vs.off(this.calc), this.vs.destroy(), this.vs = null)
        
        off(window, 'resize', this.resize)
        
        cancelAnimationFrame(this.rAF)
    }

    addFakeScrollBar() {
        
        this.dom.listener.appendChild(this.dom.scrollbar.el)
        this.dom.scrollbar.el.appendChild(this.dom.scrollbar.drag.el)

        on(this.dom.scrollbar.el, 'click', this.calcScroll)
        on(this.dom.scrollbar.el, 'mousedown', this.mouseDown)
        
        on(document, 'mousemove', this.mouseMove)
        on(document, 'mouseup', this.mouseUp)
    }

    removeFakeScrollBar() {

        off(this.dom.scrollbar.el, 'click', this.calcScroll)
        off(this.dom.scrollbar.el, 'mousedown', this.mouseDown)

        off(document, 'mousemove', this.mouseMove)
        off(document, 'mouseup', this.mouseUp)

        this.dom.listener.removeChild(this.dom.scrollbar.el)
    }

    mouseDown(e) {
        
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
        this.vars.target = Math.max(0, Math.min(this.vars.target, this.vars.bounding))
        
        this.dom.scrollbar && (this.dom.scrollbar.drag.delta = this.vars.target)
    }
    
    scrollTo(offset) {
        
        if(this.vars.native) {
            
            this.vars.direction == 'vertical' ? window.scrollTo(0, offset) : window.scrollTo(offset, 0)
            
        } else {

            this.pos.target = offset
        }
    }

    resize() {
        
        const prop = this.vars.direction === 'vertical' ? 'height' : 'width';

        this.vars.height = document.documentElement.clientHeight || window.innerHeight
        this.vars.width = document.documentElement.clientWidth || window.innerWidth
        
        if(!this.extends) {
            const bounding = this.dom.section.getBoundingClientRect()
            this.vars.bounding = this.vars.direction === 'vertical' ? bounding.height - (this.vars.native ? 0 : this.vars.height) : bounding.right - (this.vars.native ? 0 : this.vars.width)
        }
        
        if(!this.vars.native) {
            this.dom.scrollbar.drag.height = this.vars.height * (this.vars.height / this.vars.bounding)
            css(this.dom.scrollbar.drag.el, prop, this.dom.scrollbar.drag.height)
        } else {
            css(this.dom.scroll, prop, this.vars.bounding)
        }
    }
    
    destroy() {
        
        this.vars.native ? this.removeFakeScrollHeight() : this.removeFakeScrollBar()

        this.removeEvents()
    }
}

window.Smooth = Smooth

export default Smooth
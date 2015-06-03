var vs = require('./lib/vs');
var classie = require('classie');
var css = require('dom-css');
var on = require('dom-event')
var off = on.off;

var Smooth = window.Smooth = module.exports = function(opt) {
	
	if (!(this instanceof Smooth))
		return new Smooth(opt)

	opt = opt || {}

	this.rAF;
	
	this.pos = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
	
	this.direction = opt.direction || 'vertical';
	
	this.prop = (this.direction == 'vertical') ? 'height' : 'width';
	
	this.section = opt.section || document.querySelector('.vs-section');
	
	this.ease = opt.ease || 0.1;
	
	this.els = (typeof opt.els != 'undefined') ? Array.prototype.slice.call(opt.els, 0) : [this.section];
	
	this.to = Array.prototype.slice.call(document.querySelectorAll('.vs-scrollto'), 0);

	this.bounding = (this.direction == 'vertical')
		? this.section.getBoundingClientRect().height - window.innerHeight
		: this.section.getBoundingClientRect().left + this.section.getBoundingClientRect().right - window.innerHeight;
	
	this.scrollbar = {
		active: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.active : 'false',
		el: document.createElement('div'),
		drag: {
			el: document.createElement('div'),
			clicked: false,
			deltaY: 0, deltaX: 0,
			speed: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.speed || 3 : 3,
			height: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.height || 50 : 50,
		},
		bg: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.bg : 'false',
		main: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.main : 'false'
	}
};

Smooth.prototype.constructor = Smooth;

Smooth.prototype.init = function(){

	var self = this;

	this.build();

	vs.on(this.calc.bind(this));

	this.els.forEach(function(el){
		el.speed = (self.els.length >= 2) ? el.getAttribute('data-speed') : 1;
	});

	this.to.forEach(function(el){
		var data = el.getAttribute('data-scroll');
		
		el.targetPos = (!isNaN(data))
			? data
			: (self.direction == 'vertical')
				? document.querySelector('.'+data).getBoundingClientRect().top
				: document.querySelector('.'+data).getBoundingClientRect().left

		on(el, 'click', self.getTo.bind(self, el))
	});

	on(document, 'touchmove', this.prevent.bind(this))
	on(window, 'resize', this.resize.bind(this))

	this.run();

};

Smooth.prototype.prevent = function(e){

	e.preventDefault();

};

Smooth.prototype.calc = function(e){

	this.pos.targetY += e.deltaY;
	this.pos.targetX += e.deltaX;
	
	this.pos.targetY = Math.max(this.bounding * -1, this.pos.targetY);
	this.pos.targetY = Math.min(0, this.pos.targetY);

	this.pos.targetX = Math.max(this.bounding * -1, this.pos.targetX);
	this.pos.targetX = Math.min(0, this.pos.targetX);

};

Smooth.prototype.build = function(){
 	
 	var self = this;
	var prop = (this.direction == 'vertical')
		? "height"
		: "width"

	if(this.scrollbar.active){
		var body = document.body;
		var parent = this.scrollbar.el;
		var el = this.scrollbar.drag.el;
		var style = {'background-color': this.scrollbar.main};
		style[prop] = this.scrollbar.drag.height;
		
		// classes
		classie.add(parent, 'vs-scrollbar');
		classie.add(parent, 'vs-'+this.direction);
		classie.add(el, 'vs-scrolldrag');

		// style
		css(body, 'user-select', 'none');
		css(parent, 'background-color', this.scrollbar.bg);
		css(el, style);

		// append to DOM
		this.section.parentNode.insertBefore(parent, this.section.nextSibling);
		parent.appendChild(el);

		// events
		on(el, 'mousedown', this.down.bind(this));
		on(parent, 'click', this.calcScroll.bind(this));
		on(document, 'mousemove', this.move.bind(this));

	}
 
};

Smooth.prototype.down = function(e){

	var self = this;

	this.scrollbar.drag.clicked = true;

	on(document, 'mouseup', this.up.bind(this));

};

Smooth.prototype.up = function(){
	
	this.scrollbar.drag.clicked = false;

};

Smooth.prototype.move = function(e){

	if (this.scrollbar.drag.clicked) this.calcScroll(e);

};

Smooth.prototype.calcScroll = function(e){

	var self = this;

	if(self.direction == 'vertical'){
		self.scrollbar.drag.deltaY = e.clientY * self.scrollbar.drag.speed;

		self.pos.targetY = -self.scrollbar.drag.deltaY;
		self.pos.targetY = Math.max(self.bounding * -1, self.pos.targetY);
		self.pos.targetY = Math.min(0, self.pos.targetY);
	}
	else{
		// strange...
		self.scrollbar.drag.deltaX = e.clientX / (self.scrollbar.drag.speed + 2);

		self.pos.targetX = -self.scrollbar.drag.deltaX;
		self.pos.targetX = Math.max(self.bounding * -1, self.pos.targetX);
		self.pos.targetX = Math.min(0, self.pos.targetX);
	}

}

Smooth.prototype.run = function(){

	var self = this;
	var t, s, r, v, b, h;

	this.pos.currentY += (this.pos.targetY - this.pos.currentY) * this.ease;
	this.pos.currentX += (this.pos.targetX - this.pos.currentX) * this.ease;

	this.els.forEach(function(el) {

		t = (self.direction == 'vertical')
			? 'translateY(' + (self.pos.currentY * el.speed) + 'px) translateZ(0)'
			: 'translateX(' + (self.pos.currentX * el.speed) + 'px) translateZ(0)'

		css(el, 'transform', t);
	
	});

	if(this.scrollbar.active){

		h = self.scrollbar.drag.height;
 		
		r = (self.direction == 'vertical')
			? (Math.abs(self.pos.currentY) / (self.bounding / (window.innerHeight - h))) + (h / .5) - h
			: (Math.abs(self.pos.currentX) / (self.bounding / (window.innerWidth - h))) + (h / .5) - h
		
		r = Math.max(0, r-h);
		r = Math.min(r, r+h);
 		
		v = (self.direction == 'vertical')
			? 'translateY(' + r + 'px) translateZ(0)'
			: 'translateX(' + r + 'px) translateZ(0)'

		css(self.scrollbar.drag.el, 'transform', v);
		
	}

	this.rAF = requestAnimationFrame(this.run.bind(this));

};

Smooth.prototype.getTo = function(self, el){

	if(this.direction == 'vertical') this.pos.targetY = -el.target.targetPos;
	else this.pos.targetX = -el.target.targetPos;
	
};

Smooth.prototype.scrollTo = function(offset){

	if(this.direction == 'vertical') this.pos.targetY = -offset;
	else this.pos.targetX = -offset;
	
};

Smooth.prototype.resize = function(){

	this.bounding = (this.direction == 'vertical')
		? this.section.getBoundingClientRect().height - window.innerHeight
		: this.section.getBoundingClientRect().left + this.section.getBoundingClientRect().right - window.innerHeight;

};

Smooth.prototype.destroy = function(){

	vs.off(this.calc.bind(this));

	cancelAnimationFrame(this.rAF);
	this.rAF = undefined;

	this.to.forEach(function(el){
		off(el, 'click', self.getTo.bind(self, el))
	});

	off(document, 'touchmove', this.prevent.bind(this));
	off(window, 'resize', this.resize.bind(this));

	if(this.scrollbar.active){

		off(this.scrollbar.el, 'click', this.calcScroll.bind(this));
		off(this.scrollbar.drag.el, 'mousedown', this.down.bind(this));
		
		off(document, 'mousemove', this.move.bind(this));
		off(document, 'mouseup', this.up.bind(this));
	}

};
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
			h: (self.direction == 'vertical')
				? ((this.bounding / 2) - window.innerHeight)
				: ((this.bounding / 2) - window.innerWidth),
		},
		bg: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.bg : 'false',
		main: (typeof opt.scrollbar != 'undefined') ? opt.scrollbar.main : 'false'
	};
};

Smooth.prototype.constructor = Smooth;

Smooth.prototype.init = function(){

	var self = this;

	vs.on(this.calc.bind(this));

	this.build();

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
		var style = {};

		// classes
		classie.add(this.scrollbar.el, 'vs-scrollbar');
		classie.add(this.scrollbar.el, 'vs-'+this.direction);
		classie.add(this.scrollbar.drag.el, 'vs-scrolldrag');

		// style 
		style[prop] = this.scrollbar.drag.h;
		style['background-color'] = this.scrollbar.main;
		css(this.scrollbar.el, 'background-color', this.scrollbar.bg);
		css(this.scrollbar.drag.el, style);

		// append to DOM
		this.section.parentNode.insertBefore(this.scrollbar.el, this.section.nextSibling);
		this.scrollbar.el.appendChild(this.scrollbar.drag.el);
	}
 
};

Smooth.prototype.run = function(){

	var self = this;
	var t, s, r, v, b;

	this.pos.currentY += (this.pos.targetY - this.pos.currentY) * this.ease;
	this.pos.currentX += (this.pos.targetX - this.pos.currentX) * this.ease;

	this.els.forEach(function(el) {

		t = (self.direction == 'vertical')
			? 'translateY(' + (self.pos.currentY * el.speed) + 'px) translateZ(0)'
			: 'translateX(' + (self.pos.currentX * el.speed) + 'px) translateZ(0)'

		css(el, 'transform', t);
	
	});

	if(this.scrollbar.active){
 		
		r = (self.direction == 'vertical')
			? (Math.abs(self.pos.currentY) / (self.bounding / (window.innerHeight - self.scrollbar.drag.h))) + (self.scrollbar.drag.h / .5) - self.scrollbar.drag.h
			: (Math.abs(self.pos.currentX) / (self.bounding / (window.innerHeight - self.scrollbar.drag.h))) + (self.scrollbar.drag.h / .5) - self.scrollbar.drag.h
		
		r = Math.max(0, r-self.scrollbar.drag.h);
		r = Math.min(r, r+self.scrollbar.drag.h);
 
		v = (self.direction == 'vertical')
			? 'translateY(' + r + 'px) translateZ(0)'
			: 'translateX(' + r + 'px) translateZ(0)'

		css(self.scrollbar.drag.el, 'transform', v);
		
	}

	this.rAF = requestAnimationFrame(this.run.bind(this));

};

Smooth.prototype.getTo = function(self, el){

	if(this.direction == 'vertical'){
		this.pos.targetY = -el.target.targetPos;
	}
	else{
		this.pos.targetX = -el.target.targetPos;
	}

};

Smooth.prototype.scrollTo = function(offset){

	if(this.direction == 'vertical'){
		this.pos.targetY = -offset;
	}
	else{
		this.pos.targetX = -offset;
	}
	
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

	off(document, 'touchmove', this.prevent.bind(this))
	off(window, 'resize', this.resize.bind(this))

	this.to.forEach(function(el){
		off(el, 'click', self.getTo.bind(self, el))
	});

};
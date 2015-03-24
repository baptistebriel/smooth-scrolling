var Smooth = function(opt) {
	
	if (!(this instanceof Smooth))
		return new Smooth(opt)

	opt = opt || {}

	var rAF;
	
	this.pos = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
	
	this.direction = opt.direction || 'vertical';
	
	this.section = opt.section || document.querySelector('.vs-section');
	
	this.ease = opt.ease || 0.1;
	
	this.els = (typeof opt.els != 'undefined') ? Array.prototype.slice.call(opt.els, 0) : [this.section];
	
	this.bounding = (this.direction == 'vertical')
		? this.section.getBoundingClientRect().height - window.innerHeight
		: this.section.getBoundingClientRect().left + this.section.getBoundingClientRect().right - window.innerHeight

};

Smooth.prototype.constructor = Smooth;

Smooth.prototype.init = function(){

	var self = this;

	vs.on(this.calc.bind(this));

	this.els.forEach(function(el) {
		el.speed = (self.els.length >= 2) ? el.getAttribute("data-speed") : 1;
	});

	window.addEventListener('resize', this.resize.bind(this));

	this.run();

};

Smooth.prototype.calc = function(e){
	
	this.pos.targetY += e.deltaY;
	this.pos.targetX += e.deltaX;
	
	this.pos.targetY = Math.max(this.bounding * -1, this.pos.targetY);
	this.pos.targetY = Math.min(0, this.pos.targetY);

	this.pos.targetX = Math.max(this.bounding * -1, this.pos.targetX);
	this.pos.targetX = Math.min(0, this.pos.targetX);

};

Smooth.prototype.run = function(){

	var self = this;
	var t, s;

	this.pos.currentY += (this.pos.targetY - this.pos.currentY) * this.ease;
	this.pos.currentX += (this.pos.targetX - this.pos.currentX) * this.ease;

	this.els.forEach(function(el) {

		t = (self.direction == 'vertical')
			? 'translateY(' + (self.pos.currentY * el.speed) + 'px) translateZ(0)'
			: 'translateX(' + (self.pos.currentX * el.speed) + 'px) translateZ(0)'
		s = el.style;

		s['webkitTransform'] = t;
		s['msTransform'] = t;
		s.transform = t;
	
	});

	rAF = requestAnimationFrame(this.run.bind(this));

};

Smooth.prototype.resize = function(){

	this.bounding = (this.direction == 'vertical')
		? this.section.getBoundingClientRect().height - window.innerHeight
		: this.section.getBoundingClientRect().left + this.section.getBoundingClientRect().right - window.innerHeight

};

Smooth.prototype.destroy = function(){

	vs.off(this.calc.bind(this));
	cancelAnimationFrame(rAF);

};
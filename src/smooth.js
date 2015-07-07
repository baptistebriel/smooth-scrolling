var Smooth = function(opt) {
	
	if (!(this instanceof Smooth))
		return new Smooth(opt)
		
	this.createBound();

	opt = opt || {}

	this.rAF = undefined;
	
	this.pos = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
	
	this.direction = opt.direction || 'vertical';
	
	this.section = opt.section || document.querySelector('.vs-section');
	
	this.ease = opt.ease || 0.1;
	
	this.els = (typeof opt.els != 'undefined') ? Array.prototype.slice.call(opt.els, 0) : [this.section];
	
	this.to = Array.prototype.slice.call(document.querySelectorAll('.vs-scrollto'), 0);

	this.bounding = (this.direction == 'vertical')
		? this.section.getBoundingClientRect().height - window.innerHeight
		: this.section.getBoundingClientRect().left + this.section.getBoundingClientRect().right - window.innerHeight
		
};

Smooth.prototype.constructor = Smooth;

Smooth.prototype.init = function(){

	var self = this;
	
	// not supporting scrollbar for now
	//this.build();

	vs.on(this.calc);

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
		
		el.addEventListener('click', self.getTo.bind(self, el));
	});
	
	document.addEventListener('touchmove', this.prevent);
	window.addEventListener('resize', this.resize);
	
	this.run();

};

Smooth.prototype.createBound = function(){
	
	['down', 'move', 'up', 'calcScroll', 'calc', 'getTo', 'prevent', 'resize']
	.forEach(function(fn) {
		this[fn] = this[fn].bind(this);
	}, this);
    
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

Smooth.prototype.run = function(){

	var self = this;
	var t, s, v, b, r;

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
		: this.section.getBoundingClientRect().left + this.section.getBoundingClientRect().right - window.innerHeight

};

Smooth.prototype.destroy = function(){

	vs.off(this.calc);
	
	cancelAnimationFrame(this.rAF);
	this.rAF = undefined;
	
	this.to.forEach(function(el){
		el.removeEventListener('click', self.getTo);
	});
 	
	document.removeEventListener('touchmove', this.prevent);
	window.removeEventListener('resize', this.resize);

};

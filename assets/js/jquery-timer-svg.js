'use strict'
$.fn.timerSVG = function(options) {
	if (!options) options = {};

	function Core($this) {
		this.target_container   = $this;
		this.target             = options.target_class ? $this.find('.'+options.target_class) : $this;
		this.theTimer           = null;
		this.theSeconds         = options.time ? options.time:60;
		this.currentSeconds     = 0;
		this.radius             = 90;
		this.miliseconds        = null;
		this.startFrom          = options.start_from ? options.start_from : 0;
		this.timeEnd            = options.timeEnd ? options.timeEnd : function(){};
		this.strokeSize         = options.stroke_size ? options.stroke_size : 30;
		this.hide_mobile        = options.hide_mobile ? options.hide_mobile : false;
		this.label              = options.label ? options.label : '';
		this.text               = options.text ? options.text : null;
		this.css_class          = options.css_class ? options.css_class : '';
		this.init();
	}

	Core.prototype = {
		init: function() {
			$('#svg-timer').remove();
			var $this = this;
			if ($this.isMobile())
				$this._initLine();
			else
				$this._initCircle();
			$this.events();
		},

		//CIRCLE methods
		_initCircle: function () {
			var $this = this, param, draw;
			$this.target.html(this.getCircleHtml());
			$this.stroke				= $this.target.find("#stroke");
			$this.stroke_background		= $this.target.find("#stroke-background");
			$this.background			= $this.target.find("#background");
			$this.time_container		= $this.target.find("#time");
			$this.label_container		= $this.target.find("#label");
			$this.stroke_background.attr('stroke-width', $this.strokeSize);
			$this.stroke.attr('stroke-width', $this.strokeSize);

			param = $this.target.height()>$this.target.width() ? $this.target.width() : $this.target.height();
			$this.radius = (param/2)*0.75;
			$this.offset = param/2 - this.radius;

			$this.background.attr('cx', param/2);
			$this.background.attr('cy', param/2);
			$this.background.attr('r', param/2);

			$this.time_container.attr('x', param/2);
			$this.time_container.attr('y', param/2);

			$this.label_container.attr('x', param/2);
			$this.label_container.attr('y', param/2+$this.time_container.height()+10);
			$this.label_container.html($this.label);

			draw = $this.getCircleCoord($this.radius, 359.99);
			$this.stroke_background.attr('d', draw);

		},

		updateTimerCircle: function() {
			var date = new Date();
			if ( this.miliseconds == null )  this.miliseconds = date.getTime();
			var diff    = (date.getTime() -  this.miliseconds) % (1000 *  this.theSeconds) + this.startFrom * 1000;
			this.degrees = 0.36 * diff /  this.theSeconds;
			this.currentSeconds = this.theSeconds - Math.floor(diff / 1000);
			this.drawCircle( this.secondsToMinutes(this.currentSeconds) );
		},

		drawCircle: function(seconds) {
			if ( this.degrees > 359 ) {
				this._setText('00:00');
				this.stop();
				this.degrees = 359.99;
				if (typeof this.timeEnd == 'function' )
					this.timeEnd();
			} else {
				this._setText(seconds);
			}
			var draw = this.getCircleCoord(this.radius);
			this.stroke.attr('d', draw);
		},

		getCircleCoord: function(radius, degrees) {
			if (!degrees) degrees = this.degrees;
			if (!this.degrees) this.degrees = 0;

			var radians = degrees * Math.PI / 180,
				rX = radius + this.offset + Math.sin(radians) * radius,
				rY = radius + this.offset - Math.cos(radians) * radius,
				dir = (degrees > 180) ? 1 : 0,
				coord = 'M' + (radius 	+ this.offset) 	+ ',' 		+ this.offset + ' '
					+	'L' + (radius 	+ this.offset)		+ ',' 		+ this.offset + ' '
					+	'A' + radius 	+ ',' 				+ radius 	+ ' 0 ' + dir + ',1 '
					+	rX 	+ ',' 		+ rY;
			return coord;
		},

		getCircleHtml: function () {
			return '<svg style="width:100%; height:100%; float:left;" id="svg-timer"  xmlns="http://www.w3.org/2000/svg" version="1.1">'
				+	'	<circle id="background" cx="" cy="" r="" fill="#fff"  style="opacity: 0.98"/>'
				+	'	<path id="stroke-background" d="" fill="none" stroke="" stroke-width=""  />'
				+	'	<path id="stroke" d=""  fill="none" stroke="" stroke-width="" />'
				+	'	<text id="time" x="" y="" text-anchor="middle" fill="#000" style="font-size:1em;">0</text>'
				+	'	<text id="label" x="" y="" text-anchor="middle" fill="#000" style="font-size:0.4em;"></text>'
				+	'</svg>';
		},


		//LINE methods

		_initLine: function () {
			var $this = this, param, draw, diff;
			$this.target.html($this.getLineHtml());
			$this.stroke				= $this.target.find("#stroke");
			$this.stroke_background		= $this.target.find("#stroke-background");
			$this.background			= $this.target.find("#background");
			$this.time_container		= $this.target.find("#time");
			$this.label_container		= $this.target.find("#label");
			$this.stroke_background.attr('stroke-width', $this.strokeSize);
			$this.stroke.attr('stroke-width', $this.strokeSize);
			param = $this.target.width();
			$this.offset = $this.target.height() - $this.strokeSize/2;

			draw = $this.getLineCoord($this.offset, param);
			$this.stroke_background.attr('d', draw);

			$this.time_container.attr('x', param/2);
			$this.time_container.attr('y', $this.time_container.height()+5);

			$this.label_container.attr('x', param/2);
			$this.label_container.attr('y', $this.time_container.height()+25);

			$this.label_container.html($this.label);

			diff    = this.degrees * this.theSeconds / 0.36;
			$this.drawLine(this.secondsToMinutes(this.currentSeconds), diff);
		},

		updateTimerLine: function() {
			var date = new Date();
			if ( this.miliseconds == null )  this.miliseconds = date.getTime();
			var diff    = (date.getTime() -  this.miliseconds ) % (1000 *  this.theSeconds) + this.startFrom * 1000;
			this.degrees = 0.36 * diff /  this.theSeconds;
			this.currentSeconds = this.theSeconds - Math.floor(diff / 1000);
			this.drawLine( this.secondsToMinutes(this.currentSeconds), diff );
		},

		drawLine: function(seconds, length) {
			var $this = this;
			if ($this.degrees > 359) {
				this._setText('00:00');
				$this.stop();
				$this.degrees = 359.99;
				if (typeof $this.timeEnd == 'function')
					$this.timeEnd();
			} else {
				this._setText(seconds);
			}

			var param = $this.target.width(),
				size = param*length/($this.theSeconds*1000),
				draw = $this.getLineCoord($this.offset, size);

			$this.stroke.attr('d', draw);

		},

		getLineCoord: function(offset, size) {
			if (size) {
				return 'M 0 '+offset+' l '+size+' 0 ';
			}
		},

		getLineHtml: function () {
			return '<svg style="width:100%; height:100%; float:left;" id="svg-timer"  xmlns="http://www.w3.org/2000/svg" version="1.1">'
				+	'	<text id="time" x="" y="" text-anchor="middle" fill="#000" style="font-size:1em;">0</text>'
				+	'	<text id="label" x="" y="" text-anchor="middle" fill="#000" style="font-size:0.6em;"></text>'
				+	'	<path id="stroke-background" d="" fill="none" stroke="" stroke-width=""  />'
				+	'	<path id="stroke" d=""  fill="none" stroke="" stroke-width="" />'
				+	'</svg>';
		},


		//GLOBAL methods

		start: function(initial) {
			var $this = this;
			$this.theTimer = setInterval(function(){
				if ($this.isMobile()) {
					$this.updateTimerLine();
				} else
					$this.updateTimerCircle();
			}, 10);
		},

		stop: function() {

			this._setText(this.secondsToMinutes(this.currentSeconds-1));
			this.startFrom = this.theSeconds - this.currentSeconds+1;
			this.miliseconds = null;

			clearInterval(this.theTimer);
		},

		setText: function(text) {
			this.text = text;
		},

		updateLabel: function (text) {
			this.label_container.text(text);
		},

		events: function () {
			var $this = this;
			$( window ).resize(function() {
				$this.resizeTimer();
			});
		},
		resizeTimer: function() {
			if (this.isMobile()) {
				this._initLine();
				this.updateTimerLine();
			}
			else {
				this._initCircle();
				this.updateTimerCircle();
			}
		},

		isMobile: function() {
			if (this.hide_mobile) return false;
			return ($(window).width()<640)? true:false;
		},

		_setText: function(text) {
			var $this = this, _text;
			_text = $this.text ? $this.text : text;
			$this.time_container.html(_text);
		},

		secondsToMinutes: function(time) {
			var minutes = Math.floor(time / 60);
			if (minutes<10) minutes = '0'+minutes;
			var seconds = time - minutes * 60;
			if (seconds<10) seconds = '0'+seconds;
			return minutes+':'+seconds;
		}
	}
	return new Core(this);
}

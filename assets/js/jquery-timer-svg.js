$.fn.timerSVG = function(options) {
	if (!options) options = {};
	function Core($this) {
		this.target				= $this;
		this.theTimer			= null;
		this.theSeconds 		= (options.time)?options.time:60;
		this.initial_seconds		= (options.time)?options.time:60;
		this.currentSeconds 	= 0;
		this.radius 			= 90;
		this.miliseconds 		= null;
		this.activeStrokeColor	= (options.activeStrokeColor)?options.activeStrokeColor:'#472b93';
		this.strokeColor		= (options.strokeColor)?options.strokeColor:'#fc7a0f';
		this.startFrom			= (options.start_from)?options.start_from:0;
		this.timeEnd			= (options.timeEnd)?options.timeEnd:function(){};
		this.strokeSize			= (options.strokeSize)?options.strokeSize:30;
		this.repeat				= (options.repeat)?options.repeat:false;
		this.waiteForStart		= (options.waite_for_start)?options.waite_for_start:false;
		this.hide_mobile		= (options.hide_mobile)?options.hide_mobile:false;
		this.label				= (options.label)?options.label:'';
		this.init();
		this.events();
	}

	Core.prototype = {
		init: function() {
			var $this = this;
			if ($this.isMobile())
				$this._initLine();
			else
				$this._initCircle();
			//$this.start();
		},

		//CIRCLE methods
		_initCircle: function() {
			$this = this;
			$this.target.html(this.getCircleHtml());
			$this.stroke				= $this.target.find("#progress");
			$this.stroke_background		= $this.target.find("#stroke-background");
			$this.background			= $this.target.find("#background");
			$this.time_container		= $("#time");
			$this.label_container		= $("#label");
			$this.stroke_background.attr('stroke', $this.strokeColor);
			$this.stroke_background.attr('stroke-width', $this.strokeSize);
			$this.stroke.attr('stroke',$this.activeStrokeColor);
			$this.stroke.attr('stroke-width', $this.strokeSize);
			var param = ($this.target.height()>$this.target.width())?$this.target.width():$this.target.height();
			$this.radius = (param/2)*0.75;
			$this.offset = param/2 - (this.strokeSize/2 + this.radius*2 )/2+6;
			var draw = $this.drawCircle($this.radius, 359.99);
			$this.stroke_background.attr('d', draw);

			$this.background.attr('cx', param/2);
			$this.background.attr('cy', param/2);
			$this.background.attr('r', param/2);

			$this.time_container.attr('x', param/2);
			$this.time_container.attr('y', param/2);

			$this.label_container.attr('x', param/2);
			$this.label_container.attr('y', param/2+$this.time_container.height()+10);
			$this.label_container.html($this.label);

			$this.updateCircle($this.secondsToMinutes($this.currentSeconds));
		},

		updateTimerCircle: function() {
			var date = new Date();
			if ( this.miliseconds == null )  this.miliseconds = date.getTime();
			var diff    = (date.getTime() -  this.miliseconds) % (1000 *  this.theSeconds) + this.startFrom * 1000;
			this.degrees = 0.36 * diff /  this.theSeconds;
			this.currentSeconds = this.theSeconds - Math.floor(diff / 1000);
			this.updateCircle( this.secondsToMinutes(this.currentSeconds) );
		},

		updateCircle: function(seconds) {
			if (this.degrees > 359 && !this.repeat) {
				this.time_container.html('00:00');
				this.stop();
				this.degrees = 359.99;
				if (typeof this.timeEnd == 'function')
					this.timeEnd();
			} else {
				this.time_container.html(seconds);
			}
			var draw = this.drawCircle(this.radius);
			this.stroke.attr('d', draw);
		},

		drawCircle: function(radius, degrees) {
			if (!degrees) degrees = this.degrees;
			if (!this.degrees) this.degrees = 0;

			var radians = degrees * Math.PI / 180;
			var rX = radius + this.offset + Math.sin(radians) * radius;
			var rY = radius + this.offset - Math.cos(radians) * radius;
			var dir = (degrees > 180) ? 1 : 0;
			var coord = 'M' + (radius 	+ this.offset) 	+ ',' 		+ this.offset + ' '
				+	'L' + (radius 	+ this.offset)		+ ',' 		+ this.offset + ' '
				+	'A' + radius 	+ ',' 				+ radius 	+ ' 0 ' + dir + ',1 '
				+	rX 	+ ',' 		+ rY;
			return coord;
		},

		getCircleHtml: function() {
			return '<svg style="width:100%; height:100%; float:left; " id="first"  xmlns="http://www.w3.org/2000/svg" version="1.1">'
				+	'	<circle id="background" cx="" cy="" r="" fill="#fff" />'
				+	'	<path id="stroke-background" d="" fill="none" stroke="" stroke-width=""  />'
				+	'	<path id="progress" d=""  fill="none" stroke="" stroke-width="" />'
				+	'	<text id="time" x="" y="" text-anchor="middle" fill="#000" style="font-size:1em;">0</text>'
				+	'	<text id="label" x="" y="" text-anchor="middle" fill="#000" style="font-size:1em;"></text>'
				+	'</svg>';
		},


		//LINE methods
		_initLine: function() {
			$this = this;
			$this.target.html($this.getLineHtml());
			$this.stroke				= $this.target.find("#progress");
			$this.stroke_background		= $this.target.find("#stroke-background");
			$this.background			= $this.target.find("#background");
			$this.time_container		= $("#time");
			$this.label_container		= $("#label");
			$this.stroke_background.attr('stroke', $this.strokeColor);
			$this.stroke_background.attr('stroke-width', $this.strokeSize);

			$this.stroke.attr('stroke',$this.activeStrokeColor);
			$this.stroke.attr('stroke-width', $this.strokeSize);

			var param = $this.target.width();
			$this.offset = $this.target.height() - $this.strokeSize/2;

			var draw = $this.drawLine($this.offset, param);
			$this.stroke_background.attr('d', draw);

			$this.time_container.attr('x', param/2);
			$this.time_container.attr('y', $this.time_container.height()+5);

			$this.label_container.attr('x', param/2);
			$this.label_container.attr('y', $this.time_container.height()+25);

			$this.label_container.html($this.label);

			var diff    = this.degrees * this.theSeconds / 0.36;
			$this.updateLine(this.secondsToMinutes(this.currentSeconds), diff);

		},

		updateTimerLine: function() {
			var date = new Date();
			if ( this.miliseconds == null )  this.miliseconds = date.getTime();
			var diff    = (date.getTime() -  this.miliseconds ) % (1000 *  this.theSeconds) + this.startFrom * 1000;
			this.degrees = 0.36 * diff /  this.theSeconds;
			this.currentSeconds = this.theSeconds - Math.floor(diff / 1000);
			this.updateLine( this.secondsToMinutes(this.currentSeconds), diff );
		},

		updateLine: function(seconds, length) {
			$this = this;
			if ($this.degrees > 359 && !$this.repeat) {
				$this.time_container.html('00:00');
				$this.stop();
				$this.degrees = 359.99;
				if (typeof $this.timeEnd == 'function')
					$this.timeEnd();
			} else {
				$this.time_container.html(seconds);
			}

			var param = $this.target.width();
			var size = param*length/($this.theSeconds*1000);
			var draw = $this.drawLine($this.offset, size);
			$this.stroke.attr('d', draw);
		},

		drawLine: function(offset, size) {
			if (size)
				return 'M 0 '+offset+' l '+size+' 0 ';
		},

		getLineHtml: function() {
			return '<svg style="width:100%; height:100%; float:left;" id="first"  xmlns="http://www.w3.org/2000/svg" version="1.1">'
				+	'	<text id="time" x="" y="" text-anchor="middle" fill="#000" style="font-size:1em;">0</text>'
				+	'	<text id="label" x="" y="" text-anchor="middle" fill="#000" style="font-size:1em;"></text>'
				+	'	<path id="stroke-background" d="" fill="none" stroke="" stroke-width=""  />'
				+	'	<path id="progress" d=""  fill="none" stroke="" stroke-width="" />'
				+	'</svg>';
		},

		//GLOBAL methods
		events: function () {
			var $this = this;
			$( window ).resize(function() {
				$this.resizeTimer();
			});
		},

		start: function(initial) {
			var $this = this;
			$this.theTimer = setInterval(function(){
				if ($this.isMobile()) {
					$this.updateTimerLine();
				} else
					$this.updateTimerCircle();
			}, 10);
		},

		_timer: function(sec, _callback) {
			var $this 				= self;
			$this.miliseconds 		= null;
			$this.currentSeconds 	= 0;
			$this.theSeconds 		= sec;
			$this._theTimer = setInterval(function(){
				var date = new Date();
				if ( $this.miliseconds == null )  $this.miliseconds = date.getTime();
				var diff    = (date.getTime() -  $this.miliseconds) % (1000 *  $this.theSeconds)+1000;
				$this.currentSeconds = Math.floor(diff / 1000);
				if($this.currentSeconds == $this.theSeconds) {
					clearInterval($this._theTimer);
					if (typeof _callback == 'function')
						_callback();
				}
			}, 500);
		},

		stop: function() {
			this.time_container.html(this.secondsToMinutes(this.currentSeconds-1));
			this.startFrom = this.theSeconds - this.currentSeconds+1;
			this.miliseconds = null;
			clearInterval(this.theTimer);
		},

		resizeTimer: function() {
			if (this.isMobile())
				this._initLine();
			else
				this._initCircle();
		},

		isMobile: function() {
			if (this.hide_mobile) return false;
			return ($(window).width()<800)? true:false;
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
# timer-sgv

<pre>
	$(target).timerSVG({
		time'				: 10,			//Initial time (seconds)
		activeStrokeColor	: "#472b93",	//Stroke color
		strokeColor			: "#fc7a0f",	//Background stroke color
		strokeSize			: 30,			//Stroke size
		label				: 'Some text',	//Text
		startFrom			: 0				//Starting time (seconds)
		repeat				: false			//Timer looping
		hide_mobile			: false			//Turning Off mobile version
		timeEnd				: function() {	//Callback after end of time
			//some code
		}
	});
</pre>

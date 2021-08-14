const WIDTH = view.viewSize.width * .75;
const LEVELS = 5;
const BPM = 90;

let tonality = Tonality.Major;

const synth = new Tone.Synth().toDestination();
let lastPath = 0;

const start = view.center - [WIDTH/2, view.viewSize.height * -1 / 3];
const vector = new Point([WIDTH, 0]);
let currentSegment = 0;

drawKochSegment( start, vector, LEVELS);

document.querySelector('#startButton')?.addEventListener('click', async () => {
	await Tone.start()
	console.log('audio is ready')
})


startTransport();

function startTransport() {
	Tone.Transport.bpm.value = BPM;
	Tone.Transport.scheduleRepeat( playSegment, "16n" );
	Tone.Transport.start();
}

function playSegment( time ) {
	let segment = project.activeLayer.children[ currentSegment ];
	synth.triggerAttackRelease( tonality.freq( segment.data.pitch ), "16n", time + 0.150 );
	segment.tween( {'strokeColor.alpha': 1}, 100 );
	segment.tween( {"segments[1].point": segment.data.endPoint }, 50 );
	segment.tween( {'strokeWidth': 5}, 250 ).then( function() {
		segment.tween( {'strokeWidth': 1}, 3000 );
	});
	currentSegment++;
	if ( currentSegment >= project.activeLayer.children.length ) {
		currentSegment = 0;
	}
}

// from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
Math.randomNormal = function() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function drawKochSegment( startingPoint, vector, level, currentPitch = 0, pitchOffset = 0) {

	if ( level > 0 ) {

		let pointA = startingPoint,
			pointB = pointA + vector / 3,
			pointC = pointB + (vector / 3).rotate(-60),
			pointD = pointC + (vector / 3).rotate(60),
			pointE = pointD + vector / 3;

		drawKochSegment( pointA, pointB - pointA, level-1, currentPitch );
		drawKochSegment( pointB, pointC - pointB, level-1, currentPitch + level + pitchOffset);
		drawKochSegment( pointC, pointD - pointC, level-1, currentPitch - level - pitchOffset);
		drawKochSegment( pointD, pointE - pointD, level-1, currentPitch );

	}
	else {

		var path = new Path.Line({
			from: startingPoint,
			to: startingPoint,
			strokeColor: 'cyan',
			strokeWidth: 1,
			strokeCap: 'round',
			data: { pitch: currentPitch, endPoint: startingPoint + vector }
			// shadowColor: 'cyan',
			// shadowBlur: 8,
		});
		path.strokeColor.alpha = 0;
	}
}


function onFrame( event ) {
	for ( const path of project.activeLayer.children ) {
		path.strokeColor.hue += 0.1;
	}
}




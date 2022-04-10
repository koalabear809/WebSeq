function togglePad(element){
	let curPad = instruments[element.dataset.instrument]["pads"][element.dataset.num];
	curPad.toggle = !curPad.toggle;

	curPad.toggle ? element.style.backgroundColor = "red" : element.style.backgroundColor = "#cecece";
}

function selectorClicked(element){
	let instName = element.dataset.inst;
	let seqControls = document.getElementById("seq-controls");

	//show instrument controls beneath sequencer
	seqControls.innerHTML = 
		`
			<h1>${instName}</h1>
			<button id="play-${instName}" data-inst="${instName}" style="height: 20px;">PLAY</button>
			<canvas class="waveform-display" id="waveform-${instName}" width="600px" height="100px"></canvas>
		`

	setTimeout(() => {

		// waveform
		let samples = instruments[instName]["buffer"].getChannelData(0);
		let canvas = document.getElementById(`waveform-${instName}`)
		let ctx = canvas.getContext('2d');
		let height = canvas.height;
		let width = canvas.width;

		let sampleSkip = 100;

		ctx.lineWidth = 0.5;
		let moveDist = (width / samples.length) * sampleSkip;
		let currentPos = 0;

		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(currentPos, height * samples[0]);
		for(let i = 1; i < samples.length; i += sampleSkip){
			ctx.lineTo(currentPos + moveDist, height/2 * samples[i] + height/2);
			currentPos += moveDist;
		}
		ctx.stroke();

		//buttons
		document.getElementById(`play-${instName}`).addEventListener("click", () => {
			let currentInst = instruments[instName]
			currentInst.playing = !currentInst.playing;
			if(currentInst.playing){
				currentInst.currentNode = createAudioFromBuffer(currentInst.buffer);
				currentInst.currentNode.start(0);
			} else {
				currentInst.currentNode.stop();	
				currentInst.currentNode = null;
			}
		});
	}, 0);
	
}

async function onFileDropInstrument(e){
	e.preventDefault();
	
	//insert audio buffer
	instruments[this.dataset.instrument].buffer = await createAudioBufferFromFile(e.dataTransfer.files[0])

	//show controls
	selectorClicked(this.firstElementChild);
}

function getPads(numPads, instrument){
	let allPads = [];
	for(let i = 0; i < numPads; i++){
		allPads.push({
			"view": `<div class="pad" data-num="${i}" data-instrument="${instrument}" onclick="togglePad(this)"></div>`,
			"toggle": false
		});
	}
	return allPads;
}

function newSeqRow(name){
	let seqPads = getPads(numPads, name);
	let padViews = [];

	for(let i = 0; i < seqPads.length; i++){
		padViews.push(seqPads[i].view);
	}

	//TODO: edit label?
	let label = name;
	return {
		"pads": seqPads,
		"view":
		   `<div class="seq-row" id="${name}">
				<div class="inst-selector" id="inst-selector-${name}" data-instrument="${name}">
					<div class="inst-selector-button" data-inst=${name} onclick="selectorClicked(this)">${label}</div>
				</div>
				<div class="pads-wrapper">
					${padViews.join('')}
				</div>
			</div>`
	}
}

function addSampler(name){
	var seqWrapper = document.getElementById("seq-pads-wrapper");
	var seqRow = newSeqRow(name);

	instruments[name] = {
		type: "sampler",
		buffer: null,
		pads: seqRow["pads"],
		playing: false,
		currentNode: null,
	};

	seqWrapper.innerHTML += seqRow["view"];

	/*
	 * Needs setTimeout() to process in the next event loop. This buys the
	 * DOM time to paint the seqWrapper innerHTML addition above.
	 */
	setTimeout(() => {
		var instSel = document.getElementById(`inst-selector-${name}`)
		instSel.addEventListener("dragover", (e) => {e.preventDefault();})
		instSel.addEventListener("drop", onFileDropInstrument);
	}, 0);
}

window.onload = () => {
	//make initial instruments
	addSampler("Kick");
	addSampler("Hat");
	addSampler("Snare");
	addSampler("Clap");
	console.log("derp!");
}

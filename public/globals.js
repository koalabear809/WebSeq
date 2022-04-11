var instruments = {};
class Instrument {
    constructor(type, name) {
        this.name = name;
        this.type = type;
        this.playing = false;
    }
    controlView() {
        //TODO: NOT WORKING. Need to make into structure using dom library.
        let view = `
			<h1>${this.name}</h1>
			<button id="play-${this.name}" data-inst="${this.name}" style="height: 20px;">PLAY</button>
			<canvas class="waveform-display" id="waveform-${this.name}" width="600px" height="100px"></canvas>
		`;
        setTimeout(() => {
            // waveform
            let samples = instruments[this.name]["buffer"].getChannelData(0);
            let canvas = document.getElementById(`waveform-${this.name}`);
            let ctx = canvas.getContext('2d');
            let height = canvas.height;
            let width = canvas.width;
            let sampleSkip = 100;
            ctx.lineWidth = 0.5;
            let moveDist = (width / samples.length) * sampleSkip;
            let currentPos = 0;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(currentPos, height * samples[0]);
            for (let i = 1; i < samples.length; i += sampleSkip) {
                ctx.lineTo(currentPos + moveDist, height / 2 * samples[i] + height / 2);
                currentPos += moveDist;
            }
            ctx.stroke();
            //buttons
            document.getElementById(`play-${this.name}`).addEventListener("click", () => {
                let currentInst = instruments[this.name];
                currentInst.playing = !currentInst.playing;
                if (currentInst.playing) {
                    currentInst.currentNode = createAudioFromBuffer(currentInst.buffer);
                    currentInst.currentNode.start(0);
                }
                else {
                    currentInst.currentNode.stop();
                    currentInst.currentNode = null;
                }
            });
        }, 0);
        return view;
    }
    setBuffer() {
    }
}
class Pad {
    constructor(num, name) {
        this.view = document.createElement('div');
        this.view.className = "pad";
        this.view.dataset.num = num.toString();
        this.view.dataset.instrument = name;
        this.toggle = false;
        this.view.addEventListener("click", () => {
            this.toggle = !this.toggle;
            this.toggle ? this.view.style.backgroundColor = "red" : this.view.style.backgroundColor = "#cecece";
        });
    }
}
class SeqRow {
    constructor(name) {
        this.view = document.createElement('div');
        this.view.className = "seq-row";
        this.view.id = `row-${name}`;
        this.instSelector = document.createElement('div');
        this.instSelector.className = "inst-selector";
        this.instSelector.id = `inst-selector-${name}`;
        this.button = document.createElement('div');
        this.button.className = "inst-selector-button";
        this.button.id = `inst-selector-button-${name}`;
        this.button.innerHTML = name;
        this.instSelector.appendChild(this.button);
        this.view.appendChild(this.instSelector);
        this.padsWrapper = document.createElement('div');
        this.padsWrapper.className = "pads-wrapper";
        this.pads = this.addPads(name);
        this.pads.forEach(pad => {
            this.padsWrapper.appendChild(pad.view);
        });
        this.view.appendChild(this.padsWrapper);
        instruments[name].playblocks = this.pads;
        this.button.addEventListener("click", instruments[name].controlView);
        this.button.addEventListener("dragover", (e) => { e.preventDefault(); });
        this.button.addEventListener("drop", async (e) => {
            e.preventDefault();
            instruments[name].buffer = await createAudioBufferFromFile(e.dataTransfer.files[0]);
            instruments[name].controlView();
        });
    }
    addPads(name) {
        let allPads = [];
        for (let i = 0; i < numPads; i++) {
            allPads.push(new Pad(i, name));
        }
        return allPads;
    }
}
class Seq {
    addInstrument(name) {
        instruments[name] = new Instrument("sampler", name);
        var seqWrapper = document.getElementById("seq-pads-wrapper");
        var seqRow = new SeqRow(name);
        seqWrapper.appendChild(seqRow["view"]);
    }
}
const context = new AudioContext();
var tempo = 140.0;
var numMeasures = 2;
var numPads = 4 * numMeasures; // 4/4 time
//# sourceMappingURL=globals.js.map
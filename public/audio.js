class Scheduler {
    constructor() {
        this.lookahead = 25.0;
        this.scheduleAheadTime = 0.1;
        this.currentNote = 0;
        this.nextNoteTime = 0.0;
        this.notesInQueue = [];
    }
    nextNote() {
        const secondsPerBeat = 60.0 / tempo;
        //increment
        console.log(this.currentNote);
        this.nextNoteTime += secondsPerBeat;
        this.currentNote++;
        if (this.currentNote === numPads) {
            this.currentNote = 0;
        }
    }
    scheduleNote(beatNumber, time) {
        //push note into queue
        this.notesInQueue.push({ note: beatNumber, time: time });
        //check all instruments to see if active in current column
        for (const instrument in instruments) {
            if (instruments[instrument]["playblocks"][beatNumber]["toggle"] === true) {
                //stop any current nodes playing
                if (instruments[instrument].currentNode !== null) {
                    instruments[instrument].currentNode.stop();
                    instruments[instrument].currentNode = null;
                }
                //assign to instrument node
                instruments[instrument].currentNode = createAudioFromBuffer(instruments[instrument]["buffer"]);
                //schedule start
                instruments[instrument].currentNode.start(time);
            }
        }
    }
    schedule() {
        while (this.nextNoteTime < context.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentNote, this.nextNoteTime);
            this.nextNote();
        }
        this.timerID = window.setTimeout(scheduleAgain => this.schedule(), this.lookahead);
    }
}
class Transport {
    constructor(schedule) {
        this.isPlaying = false;
        this.playButton = document.createElement('button');
        this.playButton.innerHTML = "PLAY";
        this.playButton.id = "transport-play-button";
        this.playButton.addEventListener("click", () => {
            this.isPlaying = !this.isPlaying;
            if (this.isPlaying) {
                //play that shit!
                schedule.currentNote = 0;
                schedule.nextNoteTime = context.currentTime;
                schedule.schedule(); //it begins...
            }
            else {
                window.clearTimeout(schedule.timerID);
                //stop & clear all current Nodes.
                for (const instrument in instruments) {
                    if (instruments[instrument].currentNode !== null) {
                        instruments[instrument].currentNode.stop();
                        instruments[instrument].currentNode = null;
                    }
                }
            }
        });
        this.view = document.createElement('div');
        this.view.appendChild(this.playButton);
    }
}
async function createAudioBufferFromFile(file) {
    let fileBuffer = await file.arrayBuffer();
    return context.decodeAudioData(fileBuffer);
}
function createAudioFromBuffer(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    return source;
}
function playBuffer(buffer) {
    let node = createAudioFromBuffer(buffer);
    node.start(0);
}
//# sourceMappingURL=audio.js.map
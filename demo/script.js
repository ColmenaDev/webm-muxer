const startRecordingButton = document.querySelector('#start-recording');
const endRecordingButton = document.querySelector('#end-recording');
const recordingStatus = document.querySelector('#recording-status');

/** RECORDING & MUXING STUFF */

let muxer = null;
let videoEncoder = null;
let audioEncoder = null;
let startTime = null;
let recording = false;
let audioTrack = null;
let intervalId = null;

const startRecording = async () => {
	// Check for VideoEncoder availability
	if (typeof VideoEncoder === 'undefined') {
		alert("Looks like your user agent doesn't support VideoEncoder / WebCodecs API yet.");
		return;
	}

	startRecordingButton.style.display = 'none';

	// Check for AudioEncoder availability
	if (typeof AudioEncoder !== 'undefined') {
	    // Try to get access to the user's microphone
	    try {
            userMedia = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: {
                    sampleSize: 16,
                    channelCount: 2,
                },
            })
		    audioTrack = userMedia.getAudioTracks()[0];
	    } catch (e) {}
	    if (!audioTrack) console.warn("Couldn't acquire a user media audio track.");
	} else {
		console.warn('AudioEncoder not available; no need to acquire a user media audio track.');
	}

	endRecordingButton.style.display = 'block';

	let audioSampleRate = audioTrack?.getCapabilities().sampleRate.max;

    console.log(audioSampleRate);

	// Create a WebM muxer with a video track and maybe an audio track
	muxer = new WebMMuxer({
		target: 'buffer',
		audio: {
			codec: 'A_OPUS',
			sampleRate: audioSampleRate,
			numberOfChannels: 2
		},
		firstTimestampBehavior: 'offset' // Because we're directly pumping a MediaStreamTrack's data into it
	});


	if (audioTrack) {
		audioEncoder = new AudioEncoder({
			output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
			error: e => console.error(e)
		});
		audioEncoder.configure({
			codec: 'opus',
			numberOfChannels: 2,
			sampleRate: audioSampleRate,
			bitrate: 64000
		});

		// Create a MediaStreamTrackProcessor to get AudioData chunks from the audio track
		let trackProcessor = new MediaStreamTrackProcessor({ track: audioTrack });
		let consumer = new WritableStream({
			write(audioData) {
				if (!recording) return;
				audioEncoder.encode(audioData);
				audioData.close();
			}
		});
		trackProcessor.readable.pipeTo(consumer);
	}

	startTime = document.timeline.currentTime;
	recording = true;
    drawStatus();
};
startRecordingButton.addEventListener('click', startRecording);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const drawStatus = async () => {
    while (recording == true) {
        let elapsedTime = document.timeline.currentTime - startTime;
        await sleep(100);

        recordingStatus.textContent =
               `${elapsedTime % 1000 < 500 ? '🔴' : '⚫'} Recording - ${(elapsedTime / 1000).toFixed(1)} s`;
    }
    recordingStatus.textContent = '';

};



const endRecording = async () => {
	endRecordingButton.style.display = 'none';
	recordingStatus.textContent = '';
	recording = false;

	clearInterval(intervalId);
	audioTrack?.stop();

<<<<<<< HEAD
	await audioEncoder.flush();
	let buffer = muxer.finalize();
=======
	await videoEncoder?.flush();
	await audioEncoder?.flush();
	muxer.finalize();
>>>>>>> upstream/main

	let { buffer } = muxer.target;
	downloadBlob(new Blob([buffer]));

	audioEncoder = null;
	muxer = null;
	startTime = null;
	firstAudioTimestamp = null;

	startRecordingButton.style.display = 'block';
};
endRecordingButton.addEventListener('click', endRecording);

const downloadBlob = (blob) => {
	let url = window.URL.createObjectURL(blob);
	let a = document.createElement('a');
	a.style.display = 'none';
	a.href = url;
	a.download = 'colmena-opus.weba';
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
};


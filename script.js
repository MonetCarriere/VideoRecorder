// Select DOM elements
const startButton = document.getElementById("startRecording");
const stopButton = document.getElementById("stopRecording");
const downloadButton = document.getElementById("downloadRecording");
const videoElement = document.getElementById("recordVideo");

let mediaRecorder;
let recordedChunks = [];

// Start recording function
async function startRecording() {
    try {
        // Capture screen video and audio from the microphone
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Combine both streams (screen + audio)
        const combinedStream = new MediaStream([...screenStream.getTracks(), ...audioStream.getTracks()]);

        // Show the screen stream on the video element
        videoElement.srcObject = combinedStream;
        videoElement.play();

        // Initialize MediaRecorder with the combined stream
        mediaRecorder = new MediaRecorder(combinedStream);

        // Store video chunks when data is available
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Enable stop button when recording starts
        mediaRecorder.onstart = () => {
            stopButton.disabled = false;
            startButton.disabled = true;
        };

        // Handle recording stop event
        mediaRecorder.onstop = () => {
            downloadButton.disabled = false;
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            videoElement.srcObject = null;
            videoElement.src = url;
            videoElement.play();
        };

        // Start recording
        mediaRecorder.start();
    } catch (error) {
        console.error("Error capturing screen or audio:", error);
    }
}

// Stop recording function
function stopRecording() {
    mediaRecorder.stop();
    stopButton.disabled = true;
    startButton.disabled = false;
}

// Download recording function
function downloadRecording() {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'screen-recording.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Reset for a new recording
    recordedChunks = [];
    downloadButton.disabled = true;
}

// Add event listeners
startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
downloadButton.addEventListener("click", downloadRecording);

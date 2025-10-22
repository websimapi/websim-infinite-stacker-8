export class UIManager {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.instructionsElement = document.getElementById('instructions');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');
        this.replayButton = document.getElementById('replay-button');
        this.replayViewer = document.getElementById('replay-viewer');
        this.replayVideo = document.getElementById('replay-video');
        this.closeReplayButton = document.getElementById('close-replay');
        this.downloadReplayButton = document.getElementById('download-replay');
        this.replayControlsElement = document.getElementById('replay-controls');

        this.currentReplayBlob = null;
    }

    setupEventListeners({ onPointerDown, onRestart, onViewReplay, onWindowResize }) {
        window.addEventListener('pointerdown', onPointerDown);
        this.restartButton.addEventListener('click', onRestart);
        this.replayButton.addEventListener('click', onViewReplay);
        this.closeReplayButton.addEventListener('click', () => this.hideReplayViewer());
        this.downloadReplayButton.addEventListener('click', () => this.downloadReplay());
        window.addEventListener('resize', onWindowResize, false);
    }

    updateScore(score) {
        this.scoreElement.innerText = score;
    }

    showInstructions(visible) {
        if (visible) {
            this.instructionsElement.classList.remove('hidden');
        } else {
            this.instructionsElement.classList.add('hidden');
        }
    }

    showGameOver(score) {
        this.finalScoreElement.innerText = score;
        this.gameOverElement.classList.remove('hidden');
        this.replayControlsElement.classList.remove('hidden');
    }

    hideGameOver() {
        this.gameOverElement.classList.add('hidden');
        this.replayControlsElement.classList.add('hidden');
        this.updateScore(0);
        this.showInstructions(true);
    }

    showReplayViewer(blob) {
        this.currentReplayBlob = blob;
        const url = URL.createObjectURL(blob);
        this.replayVideo.src = url;
        this.gameOverElement.classList.add('hidden');
        this.replayViewer.classList.remove('hidden');
    }

    hideReplayViewer() {
        this.replayViewer.classList.add('hidden');
        this.gameOverElement.classList.remove('hidden');
        if (this.replayVideo.src) {
            URL.revokeObjectURL(this.replayVideo.src);
            this.replayVideo.src = '';
        }
    }
    
    downloadReplay() {
        if (!this.currentReplayBlob) return;
        
        const url = URL.createObjectURL(this.currentReplayBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stacker-replay-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    setReplayButtonState(disabled, text) {
        this.replayButton.disabled = disabled;
        this.replayButton.textContent = text;
    }
}


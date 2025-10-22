import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { setupScene } from './setup.js';
import { UIManager } from './ui.js';
import { Game } from './game.js';
import { ReplayRecorder } from './replay.js';
import { CanvasUI } from './canvas-ui.js';

// Global state
let game, ui, replayRecorder, canvasUI;
let scene, world, camera, renderer, uiScene, uiCamera;

function init() {
    const {
        scene: s,
        world: w,
        camera: c,
        renderer: r,
        defaultMaterial: dm,
        uiScene: us,
        uiCamera: uc
    } = setupScene();
    scene = s;
    world = w;
    camera = c;
    renderer = r;
    uiScene = us;
    uiCamera = uc;

    ui = new UIManager();
    canvasUI = new CanvasUI(uiScene);

    const gameCallbacks = {
        onScoreUpdate: (score) => {
            ui.updateScore(score);
            canvasUI.updateScore(score);
        },
        onGameOver: (score) => {
            setTimeout(() => {
                replayRecorder?.stop();
            }, 3000);
            ui.showGameOver(score);
        }
    };

    game = new Game(scene, world, dm, camera, gameCallbacks);
    
    setupEventListeners();
    
    renderer.setAnimationLoop(animate);
    startGame();
}

function startGame() {
    game.start();
    ui.hideGameOver();
    ui.showInstructions(true);
    canvasUI.updateScore(0);
    
    replayRecorder = new ReplayRecorder(renderer.domElement);
}

function restart() {
    replayRecorder?.stop();
    game.restart();
    startGame();
}

async function viewReplay() {
    ui.setReplayButtonState(true, 'Rendering...');
    const blob = await replayRecorder.getReplayBlob();
    if (blob) {
        ui.showReplayViewer(blob);
    }
    ui.setReplayButtonState(false, 'Watch Replay');
}

function setupEventListeners() {
    ui.setupEventListeners({
        onPointerDown: () => {
            if (game.getState() === 'playing') {
                ui.showInstructions(false);
                game.onPointerDown();
            }
        },
        onRestart: restart,
        onViewReplay: viewReplay,
        onWindowResize: () => {
            const aspect = window.innerWidth / window.innerHeight;
            const frustumSize = 4;
            camera.left = frustumSize * aspect / -2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = frustumSize / -2;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

            uiCamera.left = -window.innerWidth / 2;
            uiCamera.right = window.innerWidth / 2;
            uiCamera.top = window.innerHeight / 2;
            uiCamera.bottom = -window.innerHeight / 2;
            uiCamera.updateProjectionMatrix();
            canvasUI.onWindowResize();
        }
    });
}

function animate() {
    world.step(1 / 60);
    game.update();
    
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(uiScene, uiCamera);
}

init();
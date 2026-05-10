import Phaser from 'phaser';
import { TerminalScene } from './src/scenes/TerminalScene';
import { AdminScene } from './src/scenes/AdminScene';
import { LoginScene } from './src/scenes/LoginScene';
import { MenuScene } from './src/scenes/MenuScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000000',
    pixelArt: true,
    dom: {
        createContainer: true
    },
    scene: [LoginScene, MenuScene, TerminalScene, AdminScene]
};

document.fonts.ready.then(() => {
    const game = new Phaser.Game(config);
});

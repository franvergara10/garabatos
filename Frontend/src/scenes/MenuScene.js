import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.username = localStorage.getItem('username') || "UNKNOWN USER";

        this.add.text(20, 20, "TERMINAL FEDERAL - INTERFAZ PRINCIPAL", {
            fontFamily: 'VT323', fontSize: '32px', fill: '#00ff00'
        });

        this.add.text(20, 80, `IDENTIFICADO COMO: ${this.username.toUpperCase()}`, {
            fontFamily: 'VT323', fontSize: '24px', fill: '#ffff00'
        });

        this.createButton(100, 200, "[1] INICIALIZAR NUEVA SESIÓN (NUEVA PARTIDA)", () => this.startNewGame());
        this.createButton(100, 260, "[2] REANUDAR SESIÓN PREVIA (CONTINUAR)", () => this.continueGame());
        this.createButton(100, 320, "[3] TERMINAR CONEXIÓN (SALIR)", () => this.logout(), "#ff0000");

        // Scanlines effect
        this.applyCRTFilter();
    }

    async startNewGame() {
        await fetch(`http://127.0.0.1:8080/api/v1/partida/nueva/${this.username}`, { method: 'POST' });
        this.scene.start('TerminalScene', { startNodoId: 1 });
    }

    async continueGame() {
        const response = await fetch(`http://127.0.0.1:8080/api/v1/partida/ultimo-nodo/${this.username}`);
        const data = await response.json();
        this.scene.start('TerminalScene', { startNodoId: data.nodoId });
    }

    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('username');
        this.scene.start('LoginScene');
    }

    createButton(x, y, text, callback, color = "#00ff00") {
        const btn = this.add.text(x, y, text, {
            fontFamily: 'VT323', fontSize: '28px', fill: color
        });
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }));
        btn.on('pointerout', () => btn.setStyle({ fill: color }));
        btn.on('pointerdown', callback);
        return btn;
    }

    applyCRTFilter() {
        const scanlines = this.add.graphics();
        scanlines.lineStyle(1, 0x000000, 0.3);
        for (let i = 0; i < 600; i += 4) scanlines.lineBetween(0, i, 800, i);
        scanlines.setDepth(100);
    }
}

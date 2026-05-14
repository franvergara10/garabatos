import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.username = localStorage.getItem('username') || "UNKNOWN USER";

        this.add.text(20, 20, "TERMINAL Nº 05 - MENÚ PRINCIPAL", {
            fontFamily: 'VT323', fontSize: '32px', fill: '#00ff00'
        });

        this.add.text(20, 80, `IDENTIFICADO COMO: ${this.username.toUpperCase()}`, {
            fontFamily: 'VT323', fontSize: '24px', fill: '#ffff00'
        });

        this.loadingText = this.add.text(20, 140, "CONSULTANDO REGISTROS CENTRALES...", {
            fontFamily: 'VT323', fontSize: '20px', fill: '#ffff00'
        });

        this.loadSlots();

        // Scanlines effect
        this.applyCRTFilter();
    }

    async loadSlots() {
        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/partida/slots/${this.username}`);
            const slots = await response.json();

            this.loadingText.destroy();

            let y = 160;
            slots.forEach((slotData) => {
                const text = slotData.vacio
                    ? `[ HUECO ${slotData.slot} ] - VACÍO (INICIAR NUEVA SESIÓN)`
                    : `[ HUECO ${slotData.slot} ] - DATOS: ${slotData.fecha.substring(0, 16).replace('T', ' ')}`;

                const color = slotData.vacio ? "#00ff00" : "#00ffff";
                this.createButton(20, y, text, () => this.handleSlotClick(slotData), color);
                y += 50;
            });

            this.createButton(20, y + 20, "[ CAMBIAR CLAVE DE ACCESO ]", () => this.scene.start('ChangePasswordScene'), "#00ff00");
            this.createButton(20, y + 70, "[ TERMINAR CONEXIÓN (SALIR) ]", () => this.logout(), "#ff0000");

        } catch (e) {
            console.error("Error al cargar slots:", e);
            this.loadingText.setText("ERROR: NO SE PUDO CONECTAR CON LOS REGISTROS.");
            this.loadingText.setFill("#ff0000");
        }
    }

    async handleSlotClick(slotData) {
        if (slotData.vacio) {
            await fetch(`http://127.0.0.1:8080/api/v1/partida/nueva/${this.username}/${slotData.slot}`, { method: 'POST' });
            this.scene.start('TerminalScene', { startNodoId: 1, slot: slotData.slot });
        } else {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/partida/ultimo-nodo/${this.username}/${slotData.slot}`);
            const data = await response.json();
            this.scene.start('TerminalScene', { startNodoId: data.nodoId, slot: slotData.slot });
        }
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

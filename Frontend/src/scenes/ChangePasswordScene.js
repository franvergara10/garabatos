import Phaser from 'phaser';

export class ChangePasswordScene extends Phaser.Scene {
    constructor() {
        super('ChangePasswordScene');
    }

    create() {
        this.username = localStorage.getItem('username') || "UNKNOWN USER";

        this.add.text(20, 20, "TERMINAL Nº 05 - CAMBIO DE CLAVE", {
            fontFamily: 'VT323', fontSize: '32px', fill: '#00ff00'
        });

        this.statusText = this.add.text(20, 80, "ESPERANDO NUEVAS CREDENCIALES...", {
            fontFamily: 'VT323', fontSize: '20px', fill: '#ffff00'
        });

        const formHtml = `
            <div style="color: #00ff00; font-family: 'VT323', monospace; width: 300px;">
                <label>CLAVE ACTUAL:</label><br>
                <input id="oldPass" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                
                <label>NUEVA CLAVE:</label><br>
                <input id="newPass" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>

                <label>REPETIR NUEVA CLAVE:</label><br>
                <input id="newPass2" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>

                <button id="changeBtn" style="width: 100%; background: #00ff00; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold; margin-bottom: 5px;">ACTUALIZAR CLAVE</button>
                <button id="cancelBtn" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00; padding: 10px; cursor: pointer; font-weight: bold;">CANCELAR / VOLVER</button>
            </div>
        `;

        this.add.dom(400, 300).createFromHTML(formHtml);

        document.getElementById('changeBtn').onclick = () => this.handleChange();
        document.getElementById('cancelBtn').onclick = () => {
            this.scene.start('MenuScene');
        };

        this.applyCRTFilter();
    }

    async handleChange() {
        const oldPass = document.getElementById('oldPass').value;
        const newPass = document.getElementById('newPass').value;
        const newPass2 = document.getElementById('newPass2').value;

        if (!oldPass || !newPass || !newPass2) {
            this.statusText.setText("ERROR: TODOS LOS CAMPOS SON OBLIGATORIOS.");
            this.statusText.setFill("#ff0000");
            return;
        }

        if (newPass !== newPass2) {
            this.statusText.setText("ERROR: LAS NUEVAS CLAVES NO COINCIDEN.");
            this.statusText.setFill("#ff0000");
            return;
        }

        this.statusText.setText("ACTUALIZANDO DATOS EN EL NÚCLEO...");
        this.statusText.setFill("#ffff00");

        try {
            const response = await fetch('http://127.0.0.1:8080/api/v1/usuarios/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.username, oldPassword: oldPass, newPassword: newPass })
            });

            if (response.ok) {
                this.statusText.setText("CLAVE ACTUALIZADA CORRECTAMENTE.");
                this.statusText.setFill("#00ff00");
                this.time.delayedCall(1500, () => {
                    this.scene.start('MenuScene');
                });
            } else {
                this.statusText.setText("ERROR: LA CLAVE ACTUAL NO ES VÁLIDA.");
                this.statusText.setFill("#ff0000");
            }
        } catch (e) {
            this.statusText.setText("ERROR CRÍTICO: SERVIDOR NO RESPONDE.");
            this.statusText.setFill("#ff0000");
        }
    }

    applyCRTFilter() {
        const scanlines = this.add.graphics();
        scanlines.lineStyle(1, 0x000000, 0.3);
        for (let i = 0; i < 600; i += 4) scanlines.lineBetween(0, i, 800, i);
        scanlines.setDepth(100);
    }
}

import Phaser from 'phaser';

export class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.username = "";
        this.password = "";
    }

    create() {
        this.add.text(20, 20, "TERMINAL FEDERAL - ACCESO RESTRINGIDO", {
            fontFamily: 'VT323', fontSize: '32px', fill: '#00ff00'
        });

        this.statusText = this.add.text(20, 80, "ESPERANDO CREDENCIALES...", {
            fontFamily: 'VT323', fontSize: '20px', fill: '#ffff00'
        });

        const formHtml = `
            <div style="color: #00ff00; font-family: 'VT323', monospace; width: 300px;">
                <label>IDENTIDAD:</label><br>
                <input id="loginUser" type="text" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <label>CLAVE DE ACCESO:</label><br>
                <input id="loginPass" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <button id="loginBtn" style="width: 100%; background: #00ff00; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold;">INICIAR SESIÓN / REGISTRO</button>
            </div>
        `;

        this.add.dom(400, 300).createFromHTML(formHtml);

        document.getElementById('loginBtn').onclick = () => this.handleAuth();
        
        this.applyCRTFilter();
    }

    async handleAuth() {
        this.username = document.getElementById('loginUser').value;
        this.password = document.getElementById('loginPass').value;

        if (!this.username || !this.password) {
            this.statusText.setText("ERROR: SE REQUIERE IDENTIDAD Y CLAVE.");
            this.statusText.setFill("#ff0000");
            return;
        }

        this.statusText.setText("VERIFICANDO CONEXIÓN...");
        this.statusText.setFill("#ffff00");

        try {
            const loginResp = await fetch('http://127.0.0.1:8080/api/v1/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.username, password: this.password })
            });

            if (loginResp.ok) {
                const data = await loginResp.json();
                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('username', this.username);
                this.statusText.setText("LOGIN CORRECTO. ACCESO CONCEDIDO.");
                this.time.delayedCall(1000, () => {
                    if (this.username === "admin") this.scene.start('AdminScene');
                    else this.scene.start('MenuScene');
                });
            } else {
                const regResp = await fetch('http://127.0.0.1:8080/api/v1/usuarios/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.username, password: this.password })
                });

                if (regResp.ok) {
                    const data = await regResp.json();
                    localStorage.setItem('jwt_token', data.token);
                    localStorage.setItem('username', this.username);
                    this.statusText.setText("REGISTRO COMPLETADO. BIENVENIDO.");
                    this.time.delayedCall(1000, () => {
                        if (this.username === "admin") this.scene.start('AdminScene');
                        else this.scene.start('MenuScene');
                    });
                } else {
                    this.statusText.setText("ACCESO DENEGADO: CREDENCIALES INVÁLIDAS.");
                    this.statusText.setFill("#ff0000");
                }
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

import Phaser from 'phaser';

export class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
        this.username = "";
        this.password = "";
    }

    create() {
        this.add.text(20, 20, "TERMINAL Nº 05 - ACCESO RESTRINGIDO", {
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
                
                <div id="registerFields" style="display: none;">
                    <label>CORREO ELECTRÓNICO:</label><br>
                    <input id="loginEmail" type="email" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                    <br><br>
                </div>

                <label>CLAVE DE ACCESO:</label><br>
                <input id="loginPass" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>

                <div id="registerFields2" style="display: none;">
                    <label>REPETIR CLAVE:</label><br>
                    <input id="loginPass2" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                    <br><br>
                </div>

                <button id="mainBtn" style="width: 100%; background: #00ff00; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold; margin-bottom: 5px;">INICIAR SESIÓN</button>
                <button id="toggleBtn" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00; padding: 10px; cursor: pointer; font-weight: bold;">CREAR NUEVA IDENTIDAD</button>
            </div>
        `;

        this.add.dom(400, 300).createFromHTML(formHtml);

        this.isRegisterMode = false;

        document.getElementById('mainBtn').onclick = () => {
            if (this.isRegisterMode) this.handleRegister();
            else this.handleLogin();
        };
        document.getElementById('toggleBtn').onclick = () => this.toggleMode();

        this.applyCRTFilter();
    }

    async handleLogin() {
        this.username = document.getElementById('loginUser').value;
        this.password = document.getElementById('loginPass').value;

        if (!this.username || !this.password) {
            this.statusText.setText("ERROR: SE REQUIERE IDENTIDAD Y CLAVE.");
            this.statusText.setFill("#ff0000");
            return;
        }

        this.statusText.setText("VERIFICANDO CREDENCIALES...");
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
                this.statusText.setText("ACCESO DENEGADO: CREDENCIALES INVÁLIDAS.");
                this.statusText.setFill("#ff0000");
            }
        } catch (e) {
            this.statusText.setText("ERROR CRÍTICO: SERVIDOR NO RESPONDE.");
            this.statusText.setFill("#ff0000");
        }
    }

    toggleMode() {
        this.isRegisterMode = !this.isRegisterMode;
        const reg1 = document.getElementById('registerFields');
        const reg2 = document.getElementById('registerFields2');
        const mainBtn = document.getElementById('mainBtn');
        const toggleBtn = document.getElementById('toggleBtn');

        if (this.isRegisterMode) {
            reg1.style.display = 'block';
            reg2.style.display = 'block';
            mainBtn.innerText = 'CONFIRMAR REGISTRO';
            toggleBtn.innerText = 'VOLVER A INICIO DE SESIÓN';
            this.statusText.setText("MODO DE CREACIÓN DE IDENTIDAD ACTIVO.");
        } else {
            reg1.style.display = 'none';
            reg2.style.display = 'none';
            mainBtn.innerText = 'INICIAR SESIÓN';
            toggleBtn.innerText = 'CREAR NUEVA IDENTIDAD';
            this.statusText.setText("ESPERANDO CREDENCIALES...");
        }
        this.statusText.setFill("#ffff00");
    }

    async handleRegister() {
        this.username = document.getElementById('loginUser').value;
        this.email = document.getElementById('loginEmail').value;
        this.password = document.getElementById('loginPass').value;
        const passwordRepeat = document.getElementById('loginPass2').value;

        if (!this.username || !this.email || !this.password || !passwordRepeat) {
            this.statusText.setText("ERROR: TODOS LOS CAMPOS SON OBLIGATORIOS.");
            this.statusText.setFill("#ff0000");
            return;
        }

        if (this.password !== passwordRepeat) {
            this.statusText.setText("ERROR: LAS CLAVES NO COINCIDEN.");
            this.statusText.setFill("#ff0000");
            return;
        }

        this.statusText.setText("REGISTRANDO NUEVA IDENTIDAD...");
        this.statusText.setFill("#ffff00");

        try {
            const regResp = await fetch('http://127.0.0.1:8080/api/v1/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.username, email: this.email, password: this.password })
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
                this.statusText.setText("ERROR: EL USUARIO YA EXISTE O DATOS INVÁLIDOS.");
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

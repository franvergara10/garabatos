import Phaser from 'phaser';

export class TerminalScene extends Phaser.Scene {
    constructor() {
        super('TerminalScene');
        this.fullText = "";
        this.displayText = "";
        this.charIndex = 0;
        this.isTyping = false;
        this.typeSpeed = 30;
        this.currentNodoId = 1; // ID inicial
        this.options = [];
        this.currentNodoData = null;
        this.isPasswordMode = false;
        this.currentInput = "";
    }

    preload() {
        // Aquí cargaríamos sonidos más tarde
    }

    create(data) {
        this.currentNodoId = data && data.startNodoId ? data.startNodoId : 1;
        this.username = localStorage.getItem('username') || "UNKNOWN";
        
        console.log(`TerminalScene iniciada v1.2 - Nodo: ${this.currentNodoId}`);
        this.createTerminal();
        this.loadNodo(this.currentNodoId);
        
        // Efecto CRT (Scanlines y curvatura)
        this.applyCRTFilter();

        // Sonido ambiente (Hum)
        if (this.sound.get('hum')) {
            this.sound.play('hum', { loop: true, volume: 0.1 });
        }

        // Cursor parpadeante
        this.cursor = this.add.text(0, 0, '_', {
            fontFamily: 'VT323',
            fontSize: '24px',
            fill: '#00ff00'
        });
        
        this.time.addEvent({
            delay: 500,
            callback: () => { this.cursor.visible = !this.cursor.visible; },
            loop: true
        });

        // Entrada de teclado para opciones o contraseñas
        this.input.keyboard.on('keydown', (event) => {
            if (this.isTyping) return;
            
            if (this.isPasswordMode) {
                if (event.key === 'Backspace') {
                    this.currentInput = this.currentInput.slice(0, -1);
                } else if (event.key === 'Enter') {
                    this.submitPassword();
                } else if (event.key.length === 1) {
                    this.currentInput += event.key;
                }
                
                // Actualizar la vista del input
                if (this.inputTextObj) {
                    this.inputTextObj.setText("> " + this.currentInput);
                    this.cursor.setPosition(
                        this.inputTextObj.x + this.inputTextObj.width,
                        this.inputTextObj.y + this.inputTextObj.height - 24
                    );
                }
                return;
            }

            const num = parseInt(event.key);
            if (num > 0 && num <= this.options.length) {
                this.selectOption(this.options[num - 1]);
            }
        });

        // Botón de salir al menú
        const exitBtn = this.add.text(650, 560, "[ SALIR AL MENÚ ]", {
            fontFamily: 'VT323', fontSize: '20px', fill: '#ff0000'
        });
        exitBtn.setInteractive({ useHandCursor: true });
        exitBtn.on('pointerover', () => exitBtn.setStyle({ fill: '#ffffff' }));
        exitBtn.on('pointerout', () => exitBtn.setStyle({ fill: '#ff0000' }));
        exitBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    createTerminal() {
        this.terminalText = this.add.text(20, 20, '', {
            fontFamily: 'VT323',
            fontSize: '24px',
            fill: '#00ff00',
            wordWrap: { width: 760 }
        });
    }

    async loadNodo(id) {
        console.log(`Intentando cargar nodo ${id}...`);
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/historia/escena/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("Respuesta recibida:", response);
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            console.log("Datos del nodo:", data);
            
            this.fullText = data.texto + "\n\n";
            this.options = data.opciones || [];
            this.currentNodoData = data;
            
            if (data.tipoNodo !== 'PASSWORD') {
                this.options.forEach((opt, index) => {
                    this.fullText += `[${index + 1}] ${opt.textoBoton}\n`;
                });
            }

            this.startTypewriter();

            // Auto-save progress
            this.saveProgress(id);
        } catch (error) {
            console.error("Error al cargar nodo:", error);
            this.fullText = "ERROR DE SISTEMA: INCAPAZ DE CONECTAR CON EL NÚCLEO CENTRAL.";
            this.startTypewriter();
        }
    }

    startTypewriter() {
        this.displayText = "";
        this.charIndex = 0;
        this.isTyping = true;
        this.terminalText.setText("");
        
        if (this.typeTimer) this.typeTimer.remove();
        
        this.typeTimer = this.time.addEvent({
            delay: this.typeSpeed,
            callback: this.typeChar,
            callbackScope: this,
            loop: true
        });
    }

    typeChar() {
        if (this.charIndex < this.fullText.length) {
            this.displayText += this.fullText[this.charIndex];
            this.terminalText.setText(this.displayText);
            this.charIndex++;
            
            // Sonido de tecla
            if (this.sound.get('key')) {
                this.sound.play('key', { volume: 0.2, detune: Phaser.Math.Between(-100, 100) });
            }
            
            // Posicionar cursor al final del texto actual (Cálculo simplificado compatible con Phaser 4)
            this.cursor.setPosition(
                this.terminalText.x + this.terminalText.width, 
                this.terminalText.y + this.terminalText.height - 24
            );
        } else {
            this.isTyping = false;
            this.typeTimer.remove();
            
            if (this.currentNodoData && this.currentNodoData.tipoNodo === 'PASSWORD') {
                this.showPasswordInput();
            }
        }
    }

    showPasswordInput() {
        this.isPasswordMode = true;
        this.currentInput = "";
        
        const startY = this.terminalText.y + this.terminalText.height + 20;
        
        if (this.inputTextObj) this.inputTextObj.destroy();
        
        this.inputTextObj = this.add.text(20, startY, "> ", {
            fontFamily: 'VT323',
            fontSize: '24px',
            fill: '#00ff00'
        });
        
        this.cursor.setPosition(
            this.inputTextObj.x + this.inputTextObj.width,
            this.inputTextObj.y + this.inputTextObj.height - 24
        );
    }

    submitPassword() {
        this.isPasswordMode = false;
        if (this.inputTextObj) {
            this.inputTextObj.destroy();
            this.inputTextObj = null;
        }

        const val = this.currentInput.trim();
        const correctPass = (this.currentNodoData.password || "").trim(); // Case sensitive (sin toLowerCase)
        
        if (val === correctPass) {
            if (this.options.length > 0) {
                this.loadNodo(this.options[0].destinoId);
            }
        } else {
            const errorMsg = this.currentNodoData.mensajeErrorPassword || "ACCESO DENEGADO.";
            this.fullText += `\n> ${val}\n[!] ${errorMsg}\n\n`;
            this.startTypewriter();
        }
    }

    async saveProgress(nodoId) {
        try {
            await fetch('http://127.0.0.1:8080/api/v1/partida/guardar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.username, nodoId: nodoId })
            });
            console.log(`Progreso guardado: Nodo ${nodoId}`);
        } catch (e) {
            console.error("Error al guardar progreso:", e);
        }
    }

    selectOption(option) {
        console.log("Seleccionada opción:", option);
        this.loadNodo(option.destinoId);
    }

    applyCRTFilter() {
        // Overlay de Scanlines simple usando Graphics (funciona en Canvas y WebGL)
        const scanlines = this.add.graphics();
        scanlines.lineStyle(1, 0x000000, 0.3);
        
        for (let i = 0; i < 600; i += 4) {
            scanlines.lineBetween(0, i, 800, i);
        }
        
        scanlines.setScrollFactor(0);
        scanlines.setDepth(100);

        // Añadir una viñeta oscura en los bordes
        const vignette = this.add.graphics();
        vignette.fillStyle(0x000000, 0.2);
        vignette.fillRect(0, 0, 800, 600);
        vignette.setDepth(99);
    }
}

import Phaser from 'phaser';

export class AdminScene extends Phaser.Scene {
    constructor() {
        super('AdminScene');
        this.currentView = "dashboard";
        this.editingNode = null;
        this.editingUser = null;
        this.tempOptions = [];
        this.nodesListScroll = 0;
        this.nodesListContainer = null;
        this._nodesListMaxScroll = 0;
        this._adminNodesWheel = null;
    }

    create() {
        this.drawUI();
    }

    drawUI() {
        if (this._adminNodesWheel) {
            this.input.off('wheel', this._adminNodesWheel);
            this._adminNodesWheel = null;
        }
        this.nodesListContainer = null;

        // Destruir físicamente todos los objetos previos para limpiar memoria y clicks
        this.children.each(child => child.destroy());
        this.children.removeAll(); 
        
        const forms = document.querySelectorAll('.admin-form');
        forms.forEach(f => f.remove());

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00ff00, 1);
        graphics.strokeRect(10, 10, 780, 580);
        graphics.fillStyle(0x001100, 0.9);
        graphics.fillRect(10, 10, 780, 50);

        this.add.text(20, 22, "CENTRO DE CONTROL ADMIN - SISTEMA v2.5", {
            fontFamily: 'VT323', fontSize: '28px', fill: '#00ff00'
        });

        if (this.currentView === "dashboard") this.drawDashboard();
        else if (this.currentView === "nodes") this.drawNodesView();
        else if (this.currentView === "users") this.drawUsersView();
        else if (this.currentView === "editor") this.drawNodeEditor();
        else if (this.currentView === "user_editor") this.drawUserEditor();
        else if (this.currentView === "new_user") this.drawNewUserForm();

        this.createButton(650, 550, "CERRAR SESIÓN", () => this.scene.start('LoginScene'), "#ff0000");
    }

    drawDashboard() {
        this.createButton(50, 150, "[1] GESTIONAR NODOS NARRATIVOS", () => { this.currentView = "nodes"; this.drawUI(); });
        this.createButton(50, 210, "[2] GESTIONAR USUARIOS AUTORIZADOS", () => { this.currentView = "users"; this.drawUI(); });
    }

    async drawNodesView() {
        this.createButton(20, 80, "< VOLVER", () => {
            this.nodesListScroll = 0;
            this.currentView = "dashboard";
            this.drawUI();
        }, "#ffff00");
        this.createButton(150, 80, "[+] NUEVO NODO", () => {
            this.editingNode = null; this.tempOptions = []; this.currentView = "editor"; this.drawUI();
        }, "#00ffff");

        const listTop = 135;
        const listHeight = 400;
        const rowH = 45;
        const listOriginY = 150;

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/admin/nodos`);
            const items = await response.json();
            
            if (this.currentView !== "nodes") return;

            const totalListH = items.length * rowH;
            this._nodesListMaxScroll = Math.max(0, totalListH - listHeight);
            this.nodesListScroll = Phaser.Math.Clamp(this.nodesListScroll, 0, this._nodesListMaxScroll);

            const maskG = this.make.graphics({ x: 0, y: 0, add: false });
            maskG.fillStyle(0xffffff);
            maskG.fillRect(15, listTop, 770, listHeight);
            const listMask = maskG.createGeometryMask();

            const listContainer = this.add.container(50, listOriginY - this.nodesListScroll);
            listContainer.setMask(listMask);
            this.nodesListContainer = listContainer;

            items.forEach((nodo, i) => {
                const label = `ID: ${nodo.id} | ${nodo.texto.substring(0, 40)}...`;
                const yRel = i * rowH;

                this.createButton(0, yRel, label, () => {
                    this.editingNode = nodo;
                    this.tempOptions = nodo.opciones || [];
                    this.currentView = "editor";
                    this.drawUI();
                }, "#ffffff", "18px", listContainer);

                this.createButton(550, yRel, "[ELIMINAR]", () => this.deleteNode(nodo.id), "#aa0000", "16px", listContainer);
            });

            this._adminNodesWheel = (pointer, _go, _dx, dy) => {
                if (this.currentView !== "nodes" || !this.nodesListContainer) return;
                this.nodesListScroll = Phaser.Math.Clamp(
                    this.nodesListScroll + dy * 0.6,
                    0,
                    this._nodesListMaxScroll
                );
                this.nodesListContainer.y = listOriginY - this.nodesListScroll;
            };
            this.input.on('wheel', this._adminNodesWheel);

            if (items.length * rowH > listHeight) {
                this.add.text(400, 118, "(RUEDA DEL RATÓN PARA DESPLAZAR LA LISTA)", {
                    fontFamily: 'VT323', fontSize: '18px', fill: '#008800'
                }).setOrigin(0.5, 0);
            }
        } catch (e) {}
    }

    async drawUsersView() {
        this.createButton(20, 80, "< VOLVER", () => { this.currentView = "dashboard"; this.drawUI(); }, "#ffff00");
        this.createButton(150, 80, "[+] NUEVO USUARIO", () => { this.currentView = "new_user"; this.drawUI(); }, "#00ffff");
        
        this.add.text(50, 120, "BASE DE DATOS DE USUARIOS:", { fontFamily: 'VT323', fontSize: '24px', fill: '#00ff00' });

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/admin/usuarios`);
            const items = await response.json();

            if (this.currentView !== "users") return;

            items.forEach((user, i) => {
                const label = `ID: ${user.id} | ${user.username} [${user.rol}]`;
                const yPos = 160 + (i * 50);
                
                this.createButton(50, yPos, label, () => {
                    this.editingUser = user;
                    this.currentView = "user_editor";
                    this.drawUI();
                }, "#ffffff", "18px");

                this.createButton(600, yPos, "[ELIMINAR]", () => this.deleteUser(user.id), "#aa0000", "16px");
            });
        } catch (e) {}
    }

    drawNewUserForm() {
        this.createButton(20, 80, "< CANCELAR", () => { this.currentView = "users"; this.drawUI(); }, "#ffff00");

        const formHtml = `
            <div class="admin-form" style="color: #00ff00; font-family: 'VT323', monospace; width: 400px; background: rgba(0,20,0,0.95); padding: 20px; border: 1px solid #00ff00;">
                <label>NOMBRE DE USUARIO:</label><br>
                <input id="newUserName" type="text" placeholder="username" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <label>CORREO ELECTRÓNICO:</label><br>
                <input id="newUserEmail" type="email" placeholder="email@ejemplo.com" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <label>CLAVE DE ACCESO:</label><br>
                <input id="newUserPass" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <label>ROL DEL SISTEMA:</label><br>
                <select id="newUserRol" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                    <option value="ROLE_PLAYER">ROLE_PLAYER</option>
                    <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                </select>
                <br><br>
                <div id="newUserStatus" style="color: #ffff00; min-height: 24px;"></div>
                <br>
                <button id="createUserBtn" style="width: 100%; background: #00ff00; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold;">CREAR NUEVA IDENTIDAD</button>
            </div>
        `;

        this.add.dom(400, 320).createFromHTML(formHtml);

        document.getElementById('createUserBtn').onclick = () => this.createNewUser();
    }

    async createNewUser() {
        const username = document.getElementById('newUserName').value;
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPass').value;
        const rol = document.getElementById('newUserRol').value;
        const statusEl = document.getElementById('newUserStatus');

        if (!username || !password) {
            statusEl.style.color = '#ff0000';
            statusEl.innerText = 'ERROR: NOMBRE DE USUARIO Y CLAVE SON OBLIGATORIOS.';
            return;
        }

        statusEl.style.color = '#ffff00';
        statusEl.innerText = 'PROCESANDO...';

        const response = await fetch('http://127.0.0.1:8080/api/v1/admin/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, rol })
        });

        if (response.ok) {
            statusEl.style.color = '#00ff00';
            statusEl.innerText = `IDENTIDAD '${username}' REGISTRADA CORRECTAMENTE.`;
            this.time.delayedCall(1200, () => {
                this.currentView = 'users';
                this.drawUI();
            });
        } else {
            statusEl.style.color = '#ff0000';
            statusEl.innerText = 'ERROR: EL USUARIO YA EXISTE O LOS DATOS SON INVÁLIDOS.';
        }
    }

    drawUserEditor() {
        this.createButton(20, 80, "< CANCELAR", () => { this.currentView = "users"; this.drawUI(); }, "#ffff00");

        const formHtml = `
            <div class="admin-form" style="color: #00ff00; font-family: 'VT323', monospace; width: 400px; background: rgba(0,20,0,0.95); padding: 20px; border: 1px solid #00ff00;">
                <label>NOMBRE DE USUARIO:</label><br>
                <input id="userName" type="text" value="${this.editingUser.username}" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <label>NUEVA CLAVE (VACÍO PARA MANTENER):</label><br>
                <input id="userPass" type="password" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                <br><br>
                <label>ROL DEL SISTEMA:</label><br>
                <select id="userRol" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                    <option value="ROLE_PLAYER" ${this.editingUser.rol === 'ROLE_PLAYER' ? 'selected' : ''}>ROLE_PLAYER</option>
                    <option value="ROLE_ADMIN" ${this.editingUser.rol === 'ROLE_ADMIN' ? 'selected' : ''}>ROLE_ADMIN</option>
                </select>
                <br><br>
                <button id="saveUserBtn" style="width: 100%; background: #00ff00; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold;">ACTUALIZAR IDENTIDAD</button>
            </div>
        `;

        this.add.dom(400, 300).createFromHTML(formHtml);
        document.getElementById('saveUserBtn').onclick = () => this.saveUserData();
    }

    async saveUserData() {
        const data = {
            username: document.getElementById('userName').value,
            password: document.getElementById('userPass').value,
            rol: document.getElementById('userRol').value
        };

        const response = await fetch(`http://127.0.0.1:8080/api/v1/admin/usuarios/${this.editingUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("ÉXITO: Perfil de usuario actualizado.");
            this.currentView = "users";
            this.drawUI();
        }
    }

    async deleteUser(id) {
        if (!confirm("¿Confirmar eliminación de usuario?")) return;
        await fetch(`http://127.0.0.1:8080/api/v1/admin/usuarios/${id}`, { method: 'DELETE' });
        this.drawUI();
    }

    async deleteNode(id) {
        if (!confirm(`ATENCIÓN: ¿Eliminar nodo ${id}? Esto puede romper ramas narrativas.`)) return;
        await fetch(`http://127.0.0.1:8080/api/v1/admin/nodos/${id}`, { method: 'DELETE' });
        this.drawUI();
    }

    async drawNodeEditor() {
        this.createButton(20, 80, "< CANCELAR", () => { this.currentView = "nodes"; this.drawUI(); }, "#ffff00");

        try {
            const response = await fetch(`http://127.0.0.1:8080/api/v1/admin/nodos`);
            this.allNodes = await response.json();
        } catch (e) {
            this.allNodes = [];
        }

        const isNew = !this.editingNode;
        
        let optionsHtml = this.tempOptions.map((opt, idx) => `
            <div style="margin-bottom: 5px; display: flex; gap: 10px;">
                <input type="text" placeholder="Button Text" value="${opt.textoBoton}" onchange="window.updateOpt(${idx}, 'textoBoton', this.value)" style="flex: 2; background: #000; color: #00ff00; border: 1px solid #444;">
                <select onchange="window.updateOpt(${idx}, 'destinoId', this.value)" style="flex: 1; background: #000; color: #00ff00; border: 1px solid #444;">
                    <option value="">-- Destino --</option>
                    ${this.allNodes ? this.allNodes.map(n => `<option value="${n.id}" ${n.id == opt.destinoId ? 'selected' : ''}>[ID: ${n.id}] ${n.texto.substring(0, 15)}...</option>`).join('') : ''}
                </select>
                <button onclick="window.removeOpt(${idx})" style="background: #440000; color: #fff; border: none; cursor: pointer;">X</button>
            </div>
        `).join('');

        const isPassword = this.editingNode && this.editingNode.tipoNodo === 'PASSWORD';

        const formHtml = `
            <div class="admin-form" style="color: #00ff00; font-family: 'VT323', monospace; width: 650px; background: rgba(0,20,0,0.95); padding: 20px; border: 1px solid #00ff00;">
                <div style="display: flex; justify-content: space-between;">
                    <label>ID MANUAL DEL NODO:</label>
                    <input id="nodeId" type="number" value="${this.editingNode ? this.editingNode.id : ""}" ${this.editingNode ? "disabled" : ""} style="background: #000; color: #00ffff; border: 1px solid #00ffff; width: 60px;">
                </div>
                <br>
                <label>CONTENIDO DEL NODO (TEXTO DE LA HISTORIA):</label><br>
                <textarea id="nodeTexto" style="width: 100%; height: 80px; background: #000; color: #00ff00; border: 1px solid #00ff00; padding: 5px;">${this.editingNode ? this.editingNode.texto : ""}</textarea>
                <br><br>
                <label>TIPO DE NODO:</label><br>
                <select id="nodeTipo" onchange="window.togglePassFields()" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                    <option value="OPCION" ${!isPassword ? 'selected' : ''}>OPCIÓN MÚLTIPLE (Botones)</option>
                    <option value="PASSWORD" ${isPassword ? 'selected' : ''}>CONTRASEÑA SECRETA (Teclado)</option>
                </select>
                <br><br>
                
                <div id="passwordFields" style="display: ${isPassword ? 'block' : 'none'};">
                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label>CLAVE SECRETA:</label><br>
                            <input id="nodePassword" type="text" value="${this.editingNode && this.editingNode.password ? this.editingNode.password : ""}" style="width: 100%; background: #000; color: #00ff00; border: 1px solid #00ff00;">
                        </div>
                        <div style="flex: 2;">
                            <label>MENSAJE DE ERROR:</label><br>
                            <input id="nodePassError" type="text" value="${this.editingNode && this.editingNode.mensajeErrorPassword ? this.editingNode.mensajeErrorPassword : "ACCESO DENEGADO"}" style="width: 100%; background: #000; color: #ff0000; border: 1px solid #ff0000;">
                        </div>
                        <div style="flex: 1;">
                            <label>NODO DESTINO (Si acierta):</label><br>
                            <select id="nodePassDestino" style="width: 100%; background: #000; color: #00ffff; border: 1px solid #00ffff;">
                                <option value="">-- SELECCIONAR --</option>
                                ${this.allNodes ? this.allNodes.map(n => {
                                    const passDestVal = isPassword && this.tempOptions.length > 0 ? this.tempOptions[0].destinoId : "";
                                    return `<option value="${n.id}" ${n.id == passDestVal ? 'selected' : ''}>[ID: ${n.id}] ${n.texto.substring(0, 15)}...</option>`;
                                }).join('') : ''}
                            </select>
                        </div>
                    </div>
                    <br>
                </div>

                <div id="optionsListContainer" style="display: ${!isPassword ? 'block' : 'none'};">
                    <label>OPCIONES (RAMIFICACIONES):</label>
                    <div id="optionsList" style="max-height: 120px; overflow-y: auto; border: 1px solid #333; padding: 10px; margin-bottom: 10px;">
                        ${optionsHtml}
                    </div>
                    <button onclick="window.addOpt()" style="background: #004400; color: #00ff00; border: 1px solid #00ff00; cursor: pointer; padding: 2px 10px; margin-bottom: 10px;">+ AÑADIR OPCIÓN</button>
                    <br>
                </div>

                <button id="saveBtn" style="width: 100%; background: #00ff00; color: #000; border: none; padding: 10px; cursor: pointer; font-weight: bold; font-size: 20px;">GUARDAR NODO Y RAMAS</button>
            </div>
        `;

        this.add.dom(400, 350).createFromHTML(formHtml);

        window.togglePassFields = () => {
            const tipo = document.getElementById('nodeTipo').value;
            document.getElementById('passwordFields').style.display = tipo === 'PASSWORD' ? 'block' : 'none';
            document.getElementById('optionsListContainer').style.display = tipo === 'OPCION' ? 'block' : 'none';
        };

        window.syncForm = () => {
            const idInput = document.getElementById('nodeId');
            const textInput = document.getElementById('nodeTexto');
            if (idInput && textInput) {
                if (!this.editingNode) this.editingNode = { id: idInput.value, texto: textInput.value };
                else {
                    this.editingNode.id = idInput.value;
                    this.editingNode.texto = textInput.value;
                }
            }
        };

        window.addOpt = () => { 
            window.syncForm();
            this.tempOptions.push({ textoBoton: "", destinoId: null }); 
            this.drawUI(); 
        };
        window.removeOpt = (idx) => { 
            window.syncForm();
            this.tempOptions.splice(idx, 1); 
            this.drawUI(); 
        };
        window.updateOpt = (idx, field, val) => { this.tempOptions[idx][field] = field === 'destinoId' ? parseInt(val) : val; };
        document.getElementById('saveBtn').onclick = () => this.saveNodeWithBranches();
    }

    async saveNodeWithBranches() {
        const id = parseInt(document.getElementById('nodeId').value);
        if (isNaN(id)) return alert("Node ID is required.");

        const tipoNodo = document.getElementById('nodeTipo').value;
        let opcionesParaGuardar = [];

        if (tipoNodo === 'PASSWORD') {
            const destId = parseInt(document.getElementById('nodePassDestino').value);
            if (isNaN(destId)) return alert("El Nodo Destino es obligatorio para la contraseña.");
            // Si ya existía una opción, intentamos reutilizar su ID para no crear opciones huérfanas
            const existingOptId = (this.tempOptions.length > 0 && this.tempOptions[0].id) ? this.tempOptions[0].id : null;
            opcionesParaGuardar = [{
                id: existingOptId,
                textoBoton: "CONTRASEÑA", // Un texto de relleno ya que no se mostrará como botón
                nodoDestino: { id: destId }
            }];
        } else {
            opcionesParaGuardar = this.tempOptions.map(opt => {
                const dId = opt.destinoId;
                return {
                    id: opt.id || null,
                    textoBoton: opt.textoBoton,
                    nodoDestino: { id: parseInt(dId) }
                };
            });
        }

        const nodeData = {
            id: id,
            texto: document.getElementById('nodeTexto').value,
            tipoEvento: "DIALOGUE",
            tipoNodo: tipoNodo,
            password: document.getElementById('nodePassword').value,
            mensajeErrorPassword: document.getElementById('nodePassError').value,
            opciones: opcionesParaGuardar
        };

        const response = await fetch('http://127.0.0.1:8080/api/v1/admin/nodos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nodeData)
        });

        if (response.ok) {
            alert("SUCCESS: Node and branches saved.");
            this.currentView = "nodes";
            this.drawUI();
        } else {
            const err = await response.text();
            alert("ERROR SAVING: " + err);
        }
    }

    createButton(x, y, text, callback, color = "#00ff00", size = "24px", parentContainer = null) {
        const viewAtCreation = this.currentView;
        const btn = this.add.text(x, y, text, { fontFamily: 'VT323', fontSize: size, fill: color, padding: { x: 5, y: 2 } });
        if (parentContainer) {
            parentContainer.add(btn);
        }
        btn.setInteractive({ useHandCursor: true });
        btn.on('pointerover', () => { btn.setBackgroundColor('#004400'); btn.setStyle({ fill: '#ffffff' }); });
        btn.on('pointerout', () => { btn.setBackgroundColor('transparent'); btn.setStyle({ fill: color }); });
        btn.on('pointerdown', () => {
            // Solo ejecutar si seguimos en la misma vista que cuando se creó el botón
            if (this.currentView === viewAtCreation) {
                callback();
            }
        });
        return btn;
    }
}

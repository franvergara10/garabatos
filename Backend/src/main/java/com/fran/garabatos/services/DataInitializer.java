package com.fran.garabatos.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.fran.garabatos.persistance.entities.Nodo;
import com.fran.garabatos.persistance.entities.Opcion;
import com.fran.garabatos.persistance.repositories.NodoRepository;
import java.util.ArrayList;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private NodoRepository nodoRepository;

    @Autowired
    private com.fran.garabatos.persistance.repositories.UsuarioRepository usuarioRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Crear admin por defecto
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            com.fran.garabatos.persistance.entities.Usuario admin = new com.fran.garabatos.persistance.entities.Usuario();
            admin.setUsername("admin");
            admin.setPassword("admin");
            admin.setRol("ROLE_ADMIN");
            usuarioRepository.save(admin);
            System.out.println(">>> Usuario administrador creado (admin/admin).");
        }

        // 2. Poblar historia en español si está vacía
        if (nodoRepository.count() == 0) {
            // NODO 1: INICIO
            Nodo n1 = createNodo(1L, "SISTEMA INICIALIZADO. BIENVENIDO AL NÚCLEO FEDERAL.\nJUGADOR IDENTIFICADO: DESCONOCIDO.\n¿CUÁL ES SU OBJETIVO PRIMARIO?", "SISTEMA");
            
            // NODO 2: ACCESO A ARCHIVOS
            Nodo n2 = createNodo(2L, "ACCEDIENDO A ARCHIVOS ENCRIPTADOS...\nADVERTENCIA: DETECTADA CORRUPCIÓN EN EL SECTOR 7.\n¿DESEA INTENTAR UNA RECUPERACIÓN DE DATOS?", "MENSAJE");
            
            // NODO 3: RECUPERACIÓN (Camino A)
            Nodo n3 = createNodo(3L, "RECUPERACIÓN EN PROGRESO... [|||||-----] 50%\nHAS RECUPERADO UN FRAGMENTO: 'Proyecto Garabato - Fase 1: Mapeo Neural'.\nPARECE QUE ESTA INSTALACIÓN NO ERA SOLO UN CENTRO DE DATOS.", "HISTORIA");
            
            // NODO 4: LOGS (Camino B)
            Nodo n4 = createNodo(4L, "ENTRADA DE REGISTRO 04-B:\n'El sujeto 117 no responde a los estímulos. Es posible que necesitemos reiniciar el núcleo.'\nEL REGISTRO TERMINA ABRUPTAMENTE.", "LOG");
            
            // NODO 5: ZONA PROHIBIDA
            Nodo n5 = createNodo(5L, "ALERTA CRÍTICA: HAS ENTRADO EN LA ZONA RESTRINGIDA.\nDRONES DE SEGURIDAD ACTIVADOS.\n¿ESTÁS PREPARADO PARA ENFRENTAR LAS CONSECUENCIAS?", "PELIGRO");
            
            // NODO 6: SALIDA
            Nodo n6 = createNodo(6L, "CONEXIÓN TERMINADA. HAS ESCAPADO DEL NÚCLEO... POR AHORA.", "SALIDA");

            nodoRepository.save(n1);
            nodoRepository.save(n2);
            nodoRepository.save(n3);
            nodoRepository.save(n4);
            nodoRepository.save(n5);
            nodoRepository.save(n6);

            // OPCIONES NODO 1
            addOpcion(n1, "Buscar en Archivos", n2);
            addOpcion(n1, "Revisar Logs del Sistema", n4);

            // OPCIONES NODO 2
            addOpcion(n2, "Recuperar Fragmento", n3);
            addOpcion(n2, "Abortar e ir a Zona Prohibida", n5);

            // OPCIONES NODO 3
            addOpcion(n3, "Continuar Búsqueda", n5);

            // OPCIONES NODO 4
            addOpcion(n4, "Analizar Logs a fondo", n3);
            addOpcion(n4, "Ignorar y Salir", n6);

            // OPCIONES NODO 5
            addOpcion(n5, "Rendirse", n6);
            addOpcion(n5, "Hackear Drones", n3);

            // Guardar cambios finales
            nodoRepository.save(n1);
            nodoRepository.save(n2);
            nodoRepository.save(n3);
            nodoRepository.save(n4);
            nodoRepository.save(n5);
            nodoRepository.save(n6);
            
            System.out.println(">>> Datos narrativos inicializados en español.");
        }
    }

    private Nodo createNodo(Long id, String texto, String tipo) {
        Nodo n = new Nodo();
        n.setId(id);
        n.setTexto(texto);
        n.setTipoEvento(tipo);
        n.setOpciones(new ArrayList<>());
        return n;
    }

    private void addOpcion(Nodo origen, String texto, Nodo destino) {
        Opcion op = new Opcion();
        op.setTextoBoton(texto);
        op.setNodoOrigen(origen);
        op.setNodoDestino(destino);
        origen.getOpciones().add(op);
    }
}

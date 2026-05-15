package com.fran.garabatos.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.fran.garabatos.persistance.entities.Nodo;
import com.fran.garabatos.persistance.entities.Opcion;
import com.fran.garabatos.persistance.repositories.NodoRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            com.fran.garabatos.persistance.entities.Usuario admin = new com.fran.garabatos.persistance.entities.Usuario();
            admin.setUsername("admin");
            admin.setPassword(encoder.encode("admin"));
            admin.setRol("ROLE_ADMIN");
            usuarioRepository.save(admin);
            System.out.println(">>> Usuario administrador creado (admin/admin).");
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

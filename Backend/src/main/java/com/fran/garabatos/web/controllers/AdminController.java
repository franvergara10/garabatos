package com.fran.garabatos.web.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fran.garabatos.persistance.entities.Nodo;
import com.fran.garabatos.persistance.entities.Opcion;
import com.fran.garabatos.persistance.repositories.OpcionRepository;
import com.fran.garabatos.persistance.entities.Usuario;
import com.fran.garabatos.persistance.repositories.UsuarioRepository;
import com.fran.garabatos.services.HistoriaService;
import com.fran.garabatos.services.dto.EscenaDTO;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private HistoriaService historiaService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private OpcionRepository opcionRepository;

    @GetMapping("/nodos")
    public List<EscenaDTO> obtenerNodos() {
        return historiaService.obtenerTodosLosNodos()
                .stream()
                .map(n -> historiaService.obtenerEscena(n.getId()))
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/nodos")
    public Nodo guardarNodo(@RequestBody Nodo nodo) {
        return historiaService.guardarNodo(nodo);
    }

    @PostMapping("/opciones")
    public Opcion guardarOpcion(@RequestBody Opcion opcion) {
        return opcionRepository.save(opcion);
    }

    @DeleteMapping("/nodos/{id}")
    public ResponseEntity<?> eliminarNodo(@PathVariable Long id) {
        historiaService.eliminarNodo(id);
        return ResponseEntity.ok().build();
    }

    // --- Gestión de Usuarios ---

    @GetMapping("/usuarios")
    public List<Usuario> obtenerUsuarios() {
        return usuarioRepository.findAll();
    }

    @PutMapping("/usuarios/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody Usuario usuarioData) {
        return usuarioRepository.findById(id).map(u -> {
            u.setUsername(usuarioData.getUsername());
            if (usuarioData.getPassword() != null && !usuarioData.getPassword().isEmpty()) {
                u.setPassword(usuarioData.getPassword());
            }
            u.setRol(usuarioData.getRol());
            return usuarioRepository.save(u);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}

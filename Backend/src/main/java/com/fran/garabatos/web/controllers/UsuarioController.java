package com.fran.garabatos.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fran.garabatos.persistance.entities.Usuario;
import com.fran.garabatos.persistance.repositories.UsuarioRepository;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private com.fran.garabatos.web.config.JwtUtils jwtUtils;

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByUsername(usuario.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El usuario ya existe"));
        }
        
        usuario.setRol("ROLE_PLAYER");
        Usuario guardado = usuarioRepository.save(usuario);
        
        String token = jwtUtils.generateToken(guardado.getUsername());
        return ResponseEntity.ok(Map.of("usuario", guardado, "token", token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        
        return usuarioRepository.findByUsername(username)
            .filter(u -> u.getPassword().equals(password))
            .map(u -> {
                String token = jwtUtils.generateToken(u.getUsername());
                return ResponseEntity.ok(Map.of("usuario", u, "token", token));
            })
            .orElse(ResponseEntity.status(401).body(null));
    }
}

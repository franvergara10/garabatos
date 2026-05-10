package com.fran.garabatos.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fran.garabatos.persistance.entities.Partida;
import com.fran.garabatos.persistance.entities.Usuario;
import com.fran.garabatos.persistance.entities.Nodo;
import com.fran.garabatos.persistance.repositories.PartidaRepository;
import com.fran.garabatos.persistance.repositories.UsuarioRepository;
import com.fran.garabatos.persistance.repositories.NodoRepository;
import java.time.LocalDateTime;

@Service
public class PartidaService {

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NodoRepository nodoRepository;

    public Long getUltimoNodoId(String username) {
        return partidaRepository.findTopByUsuarioUsernameOrderByFechaUltimoGuardadoDesc(username)
                .map(p -> p.getNodoActual().getId())
                .orElse(1L); // Si no hay partida, empezamos en el 1
    }

    @Transactional
    public void guardarProgreso(String username, Long nodoId) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Nodo nodo = nodoRepository.findById(nodoId)
                .orElseThrow(() -> new RuntimeException("Nodo no encontrado"));

        Partida partida = partidaRepository.findTopByUsuarioUsernameOrderByFechaUltimoGuardadoDesc(username)
                .orElse(new Partida());

        partida.setUsuario(usuario);
        partida.setNodoActual(nodo);
        partida.setFechaUltimoGuardado(LocalDateTime.now());
        
        partidaRepository.save(partida);
    }
    
    @Transactional
    public void nuevaPartida(String username) {
        // Podríamos borrar la anterior o simplemente guardar una nueva en el nodo 1
        guardarProgreso(username, 1L);
    }
}

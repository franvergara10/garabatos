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
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
public class PartidaService {

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private NodoRepository nodoRepository;

    public List<Map<String, Object>> obtenerSlots(String username) {
        List<Partida> partidas = partidaRepository.findAllByUsuarioUsername(username);
        List<Map<String, Object>> slotsInfo = new ArrayList<>();
        
        for (int i = 1; i <= 3; i++) {
            int currentSlot = i;
            Partida p = partidas.stream().filter(part -> part.getSlot() != null && part.getSlot() == currentSlot).findFirst().orElse(null);
            Map<String, Object> info = new HashMap<>();
            info.put("slot", currentSlot);
            if (p != null) {
                info.put("vacio", false);
                info.put("nodoActual", p.getNodoActual().getId());
                info.put("fecha", p.getFechaUltimoGuardado().toString());
            } else {
                info.put("vacio", true);
            }
            slotsInfo.add(info);
        }
        return slotsInfo;
    }

    public Long getUltimoNodoId(String username, Integer slot) {
        return partidaRepository.findByUsuarioUsernameAndSlot(username, slot)
                .map(p -> p.getNodoActual().getId())
                .orElse(1L); // Si no hay partida en ese slot, empezamos en el 1
    }

    @Transactional
    public void guardarProgreso(String username, Integer slot, Long nodoId) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        Nodo nodo = nodoRepository.findById(nodoId)
                .orElseThrow(() -> new RuntimeException("Nodo no encontrado"));

        Partida partida = partidaRepository.findByUsuarioUsernameAndSlot(username, slot)
                .orElse(new Partida());

        partida.setUsuario(usuario);
        partida.setNodoActual(nodo);
        partida.setSlot(slot);
        partida.setFechaUltimoGuardado(LocalDateTime.now());
        
        partidaRepository.save(partida);
    }
    
    @Transactional
    public void nuevaPartida(String username, Integer slot) {
        // Guarda un progreso en el nodo 1 para el slot indicado (sobreescribiendo si existía)
        guardarProgreso(username, slot, 1L);
    }
}

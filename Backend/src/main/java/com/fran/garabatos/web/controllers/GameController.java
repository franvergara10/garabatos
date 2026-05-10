package com.fran.garabatos.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fran.garabatos.services.HistoriaService;
import com.fran.garabatos.services.dto.EscenaDTO;
import com.fran.garabatos.services.exceptions.PrincipalException;

@RestController
@RequestMapping("/api/v1/game")
@CrossOrigin(origins = "*")
public class GameController {

    @Autowired
    private HistoriaService historiaService;

    /**
     * Avanza en la historia dada una partida y una opción elegida.
     */
    @PostMapping("/{partidaId}/avanzar/{opcionId}")
    public ResponseEntity<?> avanzar(@PathVariable Long partidaId, @PathVariable Long opcionId) {
        try {
            EscenaDTO escena = historiaService.avanzar(partidaId, opcionId);
            return ResponseEntity.ok(escena);
        } catch (PrincipalException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    // Aquí se podrían añadir métodos para /iniciar, /cargar, etc.
}

package com.fran.garabatos.web.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fran.garabatos.services.PartidaService;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/partida")
@CrossOrigin(origins = "*")
public class PartidaController {

    @Autowired
    private PartidaService partidaService;

    @GetMapping("/ultimo-nodo/{username}")
    public ResponseEntity<?> getUltimoNodo(@PathVariable String username) {
        Long nodoId = partidaService.getUltimoNodoId(username);
        return ResponseEntity.ok(Map.of("nodoId", nodoId));
    }

    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(@RequestBody Map<String, Object> data) {
        String username = (String) data.get("username");
        Long nodoId = Long.valueOf(data.get("nodoId").toString());
        partidaService.guardarProgreso(username, nodoId);
        return ResponseEntity.ok(Map.of("status", "SAVED"));
    }

    @PostMapping("/nueva/{username}")
    public ResponseEntity<?> nueva(@PathVariable String username) {
        partidaService.nuevaPartida(username);
        return ResponseEntity.ok(Map.of("status", "NEW_GAME_READY"));
    }
}

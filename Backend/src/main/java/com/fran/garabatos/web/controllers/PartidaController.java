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

    @GetMapping("/slots/{username}")
    public ResponseEntity<?> getSlots(@PathVariable String username) {
        return ResponseEntity.ok(partidaService.obtenerSlots(username));
    }

    @GetMapping("/ultimo-nodo/{username}/{slot}")
    public ResponseEntity<?> getUltimoNodo(@PathVariable String username, @PathVariable Integer slot) {
        Long nodoId = partidaService.getUltimoNodoId(username, slot);
        return ResponseEntity.ok(Map.of("nodoId", nodoId));
    }

    @PostMapping("/guardar")
    public ResponseEntity<?> guardar(@RequestBody Map<String, Object> data) {
        String username = (String) data.get("username");
        Long nodoId = Long.valueOf(data.get("nodoId").toString());
        Integer slot = Integer.valueOf(data.get("slot").toString());
        partidaService.guardarProgreso(username, slot, nodoId);
        return ResponseEntity.ok(Map.of("status", "SAVED"));
    }

    @PostMapping("/nueva/{username}/{slot}")
    public ResponseEntity<?> nueva(@PathVariable String username, @PathVariable Integer slot) {
        partidaService.nuevaPartida(username, slot);
        return ResponseEntity.ok(Map.of("status", "NEW_GAME_READY"));
    }
}

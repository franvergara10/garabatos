package com.fran.garabatos.web.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fran.garabatos.services.HistoriaService;
import com.fran.garabatos.services.dto.EscenaDTO;
import com.fran.garabatos.services.exceptions.PrincipalException;

@RestController
@RequestMapping("/api/v1/historia")
@CrossOrigin(origins = "*") // Permite que Phaser (desde otro puerto) acceda a la API
public class HistoriaController {

    @Autowired
    private HistoriaService historiaService;

    /**
     * Endpoint para obtener una escena por su ID.
     * Maneja errores de negocio mediante try-catch.
     */
    @GetMapping("/escena/{id}")
    public ResponseEntity<?> obtenerEscena(@PathVariable Long id) {
        try {
            // Intento obtener los datos del servicio
            EscenaDTO escena = historiaService.obtenerEscena(id);
            
            // Si todo va bien, devuelvo 200 OK con el DTO
            return ResponseEntity.ok(escena);

        } catch (PrincipalException e) {
            // CAPTURA DE ERROR DE NEGOCIO (Tu excepción)
            // Creamos un mapa para devolver un JSON de error limpio a Phaser
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("mensaje", e.getMessage());
            errorBody.put("estado", "ERROR_NEGOCIO");
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody);

        } catch (Exception e) {
            // CAPTURA DE ERRORES INESPERADOS (Técnicos)
            Map<String, Object> errorBody = new HashMap<>();
            errorBody.put("mensaje", "Ocurrió un error inesperado en el servidor");
            errorBody.put("detalles", e.getClass().getSimpleName());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody);
        }
    }
}
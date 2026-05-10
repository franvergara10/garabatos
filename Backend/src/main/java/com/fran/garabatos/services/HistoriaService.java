package com.fran.garabatos.services;

import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fran.garabatos.persistance.entities.Nodo;
import com.fran.garabatos.persistance.entities.Opcion;
import com.fran.garabatos.persistance.entities.Partida;
import com.fran.garabatos.persistance.repositories.NodoRepository;
import com.fran.garabatos.persistance.repositories.OpcionRepository;
import com.fran.garabatos.persistance.repositories.PartidaRepository;
import com.fran.garabatos.services.dto.EscenaDTO;
import com.fran.garabatos.services.exceptions.PrincipalException;

@Service
public class HistoriaService {

    @Autowired
    private NodoRepository nodoRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private OpcionRepository opcionRepository;

    public EscenaDTO obtenerEscena(Long id) throws PrincipalException {
        Nodo nodo = nodoRepository.findById(id)
                .orElseThrow(() -> new PrincipalException("No existe el nodo con ID: " + id));
        return convertirADTO(nodo);
    }

    public EscenaDTO avanzar(Long partidaId, Long opcionId) throws PrincipalException {
        Partida partida = partidaRepository.findById(partidaId)
                .orElseThrow(() -> new PrincipalException("No existe la partida con ID: " + partidaId));
        Opcion opcion = opcionRepository.findById(opcionId)
                .orElseThrow(() -> new PrincipalException("No existe la opción con ID: " + opcionId));

        partida.setNodoActual(opcion.getNodoDestino());
        partida.setFechaUltimoGuardado(java.time.LocalDateTime.now());
        partidaRepository.save(partida);
        return convertirADTO(opcion.getNodoDestino());
    }

    @org.springframework.transaction.annotation.Transactional
    public Nodo guardarNodo(Nodo nodo) {
        System.out.println(">>> Guardando Nodo ID: " + nodo.getId());
        return nodoRepository.findById(nodo.getId()).map(existente -> {
            existente.setTexto(nodo.getTexto());
            existente.setTipoEvento(nodo.getTipoEvento());
            existente.setAestheticEffect(nodo.getAestheticEffect());
            existente.setTipoNodo(nodo.getTipoNodo());
            existente.setPassword(nodo.getPassword());
            existente.setMensajeErrorPassword(nodo.getMensajeErrorPassword());
            
            java.util.List<Opcion> nuevasOpciones = nodo.getOpciones() != null ? nodo.getOpciones() : new java.util.ArrayList<>();
            
            existente.getOpciones().removeIf(op -> nuevasOpciones.stream()
                .noneMatch(n -> n.getId() != null && n.getId().equals(op.getId())));
            
            for (Opcion nueva : nuevasOpciones) {
                if (nueva.getNodoDestino() != null && nueva.getNodoDestino().getId() != null) {
                    Long dId = nueva.getNodoDestino().getId();
                    Nodo dest = nodoRepository.findById(dId)
                        .orElseThrow(() -> new PrincipalException("Node ID " + dId + " does not exist."));
                    nueva.setNodoDestino(dest);
                }

                if (nueva.getId() != null) {
                    existente.getOpciones().stream()
                        .filter(op -> op.getId().equals(nueva.getId()))
                        .findFirst()
                        .ifPresent(op -> {
                            op.setTextoBoton(nueva.getTextoBoton());
                            op.setNodoDestino(nueva.getNodoDestino());
                        });
                } else {
                    nueva.setNodoOrigen(existente);
                    existente.getOpciones().add(nueva);
                }
            }
            return nodoRepository.save(existente);
        }).orElseGet(() -> {
            if (nodo.getOpciones() != null) {
                nodo.getOpciones().forEach(opt -> {
                    opt.setNodoOrigen(nodo);
                    if (opt.getNodoDestino() != null && opt.getNodoDestino().getId() != null) {
                        Long dId = opt.getNodoDestino().getId();
                        Nodo dest = nodoRepository.findById(dId).orElse(null);
                        opt.setNodoDestino(dest);
                    }
                });
            }
            return nodoRepository.save(nodo);
        });
    }

    @org.springframework.transaction.annotation.Transactional
    public void eliminarNodo(Long id) {
        // 1. Eliminar opciones que apuntan a este nodo como destino para evitar FK constraint
        java.util.List<Opcion> opcionesHuerfanas = opcionRepository.findAll().stream()
            .filter(op -> op.getNodoDestino() != null && op.getNodoDestino().getId().equals(id))
            .collect(Collectors.toList());
        opcionRepository.deleteAll(opcionesHuerfanas);

        // 2. Eliminar partidas que están actualmente en este nodo
        java.util.List<Partida> partidasAfectadas = partidaRepository.findAll().stream()
            .filter(p -> p.getNodoActual() != null && p.getNodoActual().getId().equals(id))
            .collect(Collectors.toList());
        partidaRepository.deleteAll(partidasAfectadas);

        // 3. Finalmente eliminar el nodo (sus opciones origen se borran en cascada)
        nodoRepository.deleteById(id);
    }

    public java.util.List<Nodo> obtenerTodosLosNodos() {
        return nodoRepository.findAll();
    }

    private EscenaDTO convertirADTO(Nodo nodo) {
        EscenaDTO dto = new EscenaDTO();
        dto.setId(nodo.getId());
        dto.setTexto(nodo.getTexto());
        dto.setFondo(nodo.getImagenFondo());
        dto.setPersonaje(nodo.getPersonajeSprite());
        dto.setTipoEvento(nodo.getTipoEvento());
        dto.setAestheticEffect(nodo.getAestheticEffect());
        dto.setTipoNodo(nodo.getTipoNodo());
        dto.setPassword(nodo.getPassword());
        dto.setMensajeErrorPassword(nodo.getMensajeErrorPassword());

        if (nodo.getOpciones() != null) {
            dto.setOpciones(nodo.getOpciones().stream().map(opcion -> {
                EscenaDTO.OpcionDTO opDto = new EscenaDTO.OpcionDTO();
                opDto.setId(opcion.getId());
                opDto.setTextoBoton(opcion.getTextoBoton());
                if (opcion.getNodoDestino() != null) {
                    opDto.setDestinoId(opcion.getNodoDestino().getId());
                }
                return opDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
package com.fran.garabatos.persistance.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fran.garabatos.persistance.entities.Opcion;

@Repository
public interface OpcionRepository extends JpaRepository<Opcion, Long> {
    // Podrías buscar opciones por el ID del nodo origen
    List<Opcion> findByNodoOrigenId(Long nodoId);
}
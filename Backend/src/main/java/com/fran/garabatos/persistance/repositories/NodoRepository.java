package com.fran.garabatos.persistance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fran.garabatos.persistance.entities.Nodo;

@Repository
public interface NodoRepository extends JpaRepository<Nodo, Long> {
    // Spring Data JPA generará automáticamente la consulta
}

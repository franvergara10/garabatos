package com.fran.garabatos.persistance.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.fran.garabatos.persistance.entities.Partida;
import java.util.List;

@Repository
public interface PartidaRepository extends JpaRepository<Partida, Long> {
    java.util.Optional<Partida> findTopByUsuarioUsernameOrderByFechaUltimoGuardadoDesc(String username);
    java.util.Optional<Partida> findByUsuarioUsernameAndSlot(String username, Integer slot);
    List<Partida> findAllByUsuarioUsername(String username);
}

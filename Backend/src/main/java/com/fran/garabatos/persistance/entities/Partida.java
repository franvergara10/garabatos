package com.fran.garabatos.persistance.entities;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "partidas")
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Column(nullable = false)
    private Integer slot;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_nodo_actual")
    private Nodo nodoActual;

    private java.time.LocalDateTime fechaUltimoGuardado;



    @PrePersist
    protected void onCreate() {
        fechaUltimoGuardado = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Nodo getNodoActual() { return nodoActual; }
    public void setNodoActual(Nodo nodoActual) { this.nodoActual = nodoActual; }
    public java.time.LocalDateTime getFechaUltimoGuardado() { return fechaUltimoGuardado; }
    public void setFechaUltimoGuardado(java.time.LocalDateTime fechaUltimoGuardado) { this.fechaUltimoGuardado = fechaUltimoGuardado; }

    public Integer getSlot() { return slot; }
    public void setSlot(Integer slot) { this.slot = slot; }
}
package com.fran.garabatos.persistance.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "opciones")
public class Opcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String textoBoton;

    @ManyToOne
    @JoinColumn(name = "id_nodo_origen")
    @JsonBackReference
    private Nodo nodoOrigen;

    @ManyToOne
    @JoinColumn(name = "id_nodo_destino")
    private Nodo nodoDestino;

    private String requisitoFlag;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTextoBoton() { return textoBoton; }
    public void setTextoBoton(String textoBoton) { this.textoBoton = textoBoton; }
    public Nodo getNodoOrigen() { return nodoOrigen; }
    public void setNodoOrigen(Nodo nodoOrigen) { this.nodoOrigen = nodoOrigen; }
    public Nodo getNodoDestino() { return nodoDestino; }
    public void setNodoDestino(Nodo nodoDestino) { this.nodoDestino = nodoDestino; }
    public String getRequisitoFlag() { return requisitoFlag; }
    public void setRequisitoFlag(String requisitoFlag) { this.requisitoFlag = requisitoFlag; }
}
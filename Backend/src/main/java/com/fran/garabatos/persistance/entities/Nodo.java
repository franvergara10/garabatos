package com.fran.garabatos.persistance.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "nodos")

public class Nodo {
	@Id
	private Long id;

	@Column(columnDefinition = "TEXT")
	private String texto;

	private String imagenFondo;
	private String personajeSprite;

	// Tipo de evento: MESSAGE, CHOICE, ERROR, SYSTEM
	private String tipoEvento;

	// Efecto estético: GLITCH, SHAKE, COLOR_RED, etc.
	private String aestheticEffect;

	@OneToMany(mappedBy = "nodoOrigen", cascade = CascadeType.ALL, orphanRemoval = true)
	@JsonManagedReference
	private List<Opcion> opciones;

	private String tipoNodo; // "OPCION" o "PASSWORD"
	private String password;
	private String mensajeErrorPassword;

	public String getTipoNodo() {
		return tipoNodo;
	}

	public void setTipoNodo(String tipoNodo) {
		this.tipoNodo = tipoNodo;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getMensajeErrorPassword() {
		return mensajeErrorPassword;
	}

	public void setMensajeErrorPassword(String mensajeErrorPassword) {
		this.mensajeErrorPassword = mensajeErrorPassword;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTexto() {
		return texto;
	}

	public void setTexto(String texto) {
		this.texto = texto;
	}

	public String getImagenFondo() {
		return imagenFondo;
	}

	public void setImagenFondo(String imagenFondo) {
		this.imagenFondo = imagenFondo;
	}

	public String getPersonajeSprite() {
		return personajeSprite;
	}

	public void setPersonajeSprite(String personajeSprite) {
		this.personajeSprite = personajeSprite;
	}

	public String getTipoEvento() {
		return tipoEvento;
	}

	public void setTipoEvento(String tipoEvento) {
		this.tipoEvento = tipoEvento;
	}

	public String getAestheticEffect() {
		return aestheticEffect;
	}

	public void setAestheticEffect(String aestheticEffect) {
		this.aestheticEffect = aestheticEffect;
	}

	public List<Opcion> getOpciones() {
		return opciones;
	}

	public void setOpciones(List<Opcion> opciones) {
		this.opciones = opciones;
	}

}

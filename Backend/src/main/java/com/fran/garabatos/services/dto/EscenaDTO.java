package com.fran.garabatos.services.dto;

import java.util.List;

public class EscenaDTO {
    private Long id;
    private String texto;
    private String fondo;
    private String personaje;
    private String tipoEvento;
    private String aestheticEffect;
    private List<OpcionDTO> opciones;
    private String tipoNodo;
    private String password;
    private String mensajeErrorPassword;

    public String getTipoNodo() { return tipoNodo; }
    public void setTipoNodo(String tipoNodo) { this.tipoNodo = tipoNodo; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getMensajeErrorPassword() { return mensajeErrorPassword; }
    public void setMensajeErrorPassword(String mensajeErrorPassword) { this.mensajeErrorPassword = mensajeErrorPassword; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }

    public String getFondo() { return fondo; }
    public void setFondo(String fondo) { this.fondo = fondo; }

    public String getPersonaje() { return personaje; }
    public void setPersonaje(String personaje) { this.personaje = personaje; }

    public String getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(String tipoEvento) { this.tipoEvento = tipoEvento; }

    public String getAestheticEffect() { return aestheticEffect; }
    public void setAestheticEffect(String aestheticEffect) { this.aestheticEffect = aestheticEffect; }

    public List<OpcionDTO> getOpciones() { return opciones; }
    public void setOpciones(List<OpcionDTO> opciones) { this.opciones = opciones; }

    public static class OpcionDTO {
        private Long id;
        private String textoBoton;
        private Long destinoId;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTextoBoton() { return textoBoton; }
        public void setTextoBoton(String textoBoton) { this.textoBoton = textoBoton; }

        public Long getDestinoId() { return destinoId; }
        public void setDestinoId(Long destinoId) { this.destinoId = destinoId; }
    }
}
"use client"

import React from "react"
import axios from 'axios';

import { useState } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header.tsx"
import "../styles/InstitutionRegisterPage.css"
import {toast, Toaster} from 'react-hot-toast'

interface FormData {
  nombreOficial: string
  nombreCorto: string
  correo: string
  telefono: string
  direccion: string
  ciudad: string
  estado: string
  codigoPostal: string
  logo: File | null
  colorPrincipal: string
  colorSecundario: string
  contrasena: string
  confirmarContrasena: string
  aceptaTerminos: boolean
}

const InstitutionRegisterPage = () => {
  const [formData, setFormData] = useState<FormData>({
    nombreOficial: "",
    nombreCorto: "",
    correo: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    estado: "",
    codigoPostal: "",
    logo: null,
    colorPrincipal: "#6a5acd",
    colorSecundario: "#ffffff",
    contrasena: "",
    confirmarContrasena: "",
    aceptaTerminos: false,
  })
  const [isSubmiting, setIsSubmiting] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        logo: e.target.files[0],
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true)

    try {
      const form = new FormData();
      form.append("official_name", formData.nombreOficial);
      form.append("short_name", formData.nombreCorto);
      form.append("email", formData.correo);
      form.append("phone", formData.telefono);
      form.append("address", formData.direccion);
      form.append("city", formData.ciudad);
      form.append("istate", formData.estado);
      form.append("postal_code", formData.codigoPostal);
      form.append("primary_color", formData.colorPrincipal);
      form.append("secondary_color", formData.colorSecundario);
      form.append("ipassword", formData.contrasena);
      if (formData.logo) form.append("logo", formData.logo);
  
      const response = await axios.post(
        "http://127.0.0.1:8000/api/institutions/register/", 
        form, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
  
      console.log(response.data);

      toast.success('Formulario enviado correctamente',{
        duration: 3000
      })

      // redirigir
      setTimeout(()=>{
        location.reload()
        setIsSubmiting(false)
      },3000)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error en el registro:", error.response?.data || error.message);
        // errores de la API
      } else {
        console.error("Error inesperado:", error);
      }
      // mensaje de error al usuario
    }
  }

  return (
    <div className="register-container">
      <Header />

      <div className="register-form-container">
        <h1>Registro de Institución</h1>
        <p className="form-description">
          Complete el siguiente formulario para registrar su institución en nuestra plataforma. Un administrador
          validará su información para completar el proceso.
        </p>

        <form onSubmit={handleSubmit} className="register-form">
          <section className="form-section">
            <h2>Información Institucional</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombreOficial">Nombre Oficial de la Institución *</label>
                <input
                  type="text"
                  id="nombreOficial"
                  name="nombreOficial"
                  placeholder="Nombre oficial completo"
                  value={formData.nombreOficial}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="nombreCorto">Nombre Corto</label>
                <input
                  type="text"
                  id="nombreCorto"
                  name="nombreCorto"
                  placeholder="Acrónimo o nombre abreviado"
                  value={formData.nombreCorto}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico Institucional *</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  placeholder="correo@institucion.edu"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  placeholder="Número de teléfono institucional"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                placeholder="Dirección completa"
                value={formData.direccion}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  placeholder="Ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado/Provincia *</label>
                <input
                  type="text"
                  id="estado"
                  name="estado"
                  placeholder="Estado o provincia"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="codigoPostal">Código Postal</label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                placeholder="Código postal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Identidad Visual</h2>

            <div className="form-group">
              <label htmlFor="logo">Logo de la Institución *</label>
              <input type="file" id="logo" name="logo" accept="image/*" onChange={handleFileChange} required />
            </div>

            <div className="colors-section">
              <h3>Colores Institucionales</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="colorPrincipal">Color Principal</label>
                  <div className="color-picker">
                    <input
                      type="color"
                      id="colorPrincipal"
                      name="colorPrincipal"
                      value={formData.colorPrincipal}
                      onChange={handleInputChange}
                    />
                    <span>{formData.colorPrincipal}</span>
                  </div>
                  <button type="button" className="color-button primary-color">
                    Color Principal
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="colorSecundario">Color Secundario</label>
                  <div className="color-picker">
                    <input
                      type="color"
                      id="colorSecundario"
                      name="colorSecundario"
                      value={formData.colorSecundario}
                      onChange={handleInputChange}
                    />
                    <span>{formData.colorSecundario}</span>
                  </div>
                  <button type="button" className="color-button secondary-color">
                    Color Secundario
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Seguridad</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contrasena">Contraseña *</label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarContrasena">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  placeholder="Repite la contraseña"
                  value={formData.confirmarContrasena}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="aceptaTerminos"
                name="aceptaTerminos"
                checked={formData.aceptaTerminos}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="aceptaTerminos">
                Acepto los{" "}
                <Link to="/terminos" className="terms-link">
                  términos y condiciones
                </Link>{" "}
                de la plataforma *
              </label>
            </div>

            <p className="required-note">Nota: Todos los campos marcados con * son obligatorios.</p>

            <p className="form-note">
              Al enviar este formulario, su solicitud será revisada por un administrador del sistema para verificar los
              datos proporcionados. Este proceso puede tomar hasta 48 horas hábiles.
            </p>

            <div className="form-buttons">
              <button type="submit" className="submit-button" disabled={isSubmiting}>
                Enviar Solicitud de Registro
              </button>
              <Link to="/" className="cancel-button">
                Cancelar
              </Link>
            </div>
          </section>
        </form>
      </div>
      <Toaster
  position="top-left"
  reverseOrder={false}
/>


    </div>
  )
}

export default InstitutionRegisterPage


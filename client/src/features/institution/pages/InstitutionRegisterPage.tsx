"use client";

import React from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import Header from "../../../components/Header.tsx";
import "../styles/InstitutionRegisterPage.css";
import { toast, Toaster } from "react-hot-toast";

interface FormValues {
  nombreOficial: string;
  nombreCorto: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigoPostal: string;
  logo: File | null;
  colorPrincipal: string;
  colorSecundario: string;
  contrasena: string;
  confirmarContrasena: string;
  aceptaTerminos: boolean;
}

const InstitutionRegisterPage = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
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
    },
  });

  const onSubmit = async (data: FormValues) => {
    const form = new FormData();
    const fieldsName = [
      "official_name",
      "short_name",
      "email",
      "phone",
      "address",
      "city",
      "istate",
      "postal_code",
      "logo",
      "primary_color",
      "secondary_color",
      "ipassword",
    ];

    const formValuesNames = [
      "nombreOficial",
      "nombreCorto",
      "correo",
      "telefono",
      "direccion",
      "ciudad",
      "estado",
      "codigoPostal",
      "logo",
      "colorPrincipal",
      "colorSecundario",
      "contrasena",
    ];
    fieldsName.forEach((name, index) => {
      form.append(name, data[formValuesNames[index]]);
    });

    if (data.logo) form.append("logo", data.logo);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/institutions/register/",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      toast.success("Formulario enviado correctamente", {
        duration: 3000,
      });

      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error en el registro:",
          error.response?.data || error.message
        );
      } else {
        console.error("Error inesperado:", error);
      }
    }
  };

  return (
    <div className="register-container">
      <Header />

      <div className="register-form-container">
        <h1>Registro de Institución</h1>
        <p className="form-description">
          Complete el siguiente formulario para registrar su institución en
          nuestra plataforma. Un administrador validará su información para
          completar el proceso.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <section className="form-section">
            <h2>Información Institucional</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombreOficial">
                  Nombre Oficial de la Institución *
                </label>
                <input
                  type="text"
                  id="nombreOficial"
                  {...register("nombreOficial", {
                    required: "Este campo es obligatorio",
                  })}
                  placeholder="Nombre oficial completo"
                />
                {errors.nombreOficial && (
                  <p className="error">{errors.nombreOficial.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="nombreCorto">Nombre Corto</label>
                <input
                  type="text"
                  id="nombreCorto"
                  {...register("nombreCorto")}
                  placeholder="Acrónimo o nombre abreviado"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="correo">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  id="correo"
                  {...register("correo", {
                    required: "Este campo es obligatorio",
                  })}
                  placeholder="correo@institucion.edu"
                />
                {errors.correo && (
                  <p className="error">{errors.correo.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="tel"
                  id="telefono"
                  {...register("telefono", {
                    required: "Este campo es obligatorio",
                  })}
                  placeholder="Número de teléfono institucional"
                />
                {errors.telefono && (
                  <p className="error">{errors.telefono.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección *</label>
              <input
                type="text"
                id="direccion"
                {...register("direccion", {
                  required: "Este campo es obligatorio",
                })}
                placeholder="Dirección completa"
              />
              {errors.direccion && (
                <p className="error">{errors.direccion.message}</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <input
                  type="text"
                  id="ciudad"
                  {...register("ciudad", {
                    required: "Este campo es obligatorio",
                  })}
                  placeholder="Ciudad"
                />
                {errors.ciudad && (
                  <p className="error">{errors.ciudad.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado/Provincia *</label>
                <input
                  type="text"
                  id="estado"
                  {...register("estado", {
                    required: "Este campo es obligatorio",
                  })}
                  placeholder="Estado o provincia"
                />
                {errors.estado && (
                  <p className="error">{errors.estado.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="codigoPostal">Código Postal</label>
              <input
                type="text"
                id="codigoPostal"
                {...register("codigoPostal")}
                placeholder="Código postal"
              />
            </div>
          </section>

          <section className="form-section">
            <h2>Identidad Visual</h2>

            <div className="form-group">
              <label htmlFor="logo">Logo de la Institución *</label>
              <Controller
                name="logo"
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                  />
                )}
              />
              {errors.logo && <p className="error">{errors.logo.message}</p>}
            </div>

            <div className="colors-section">
              <h3>Colores Institucionales</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="colorPrincipal">Color Principal</label>
                  <div className="color-picker">
                    <Controller
                      name="colorPrincipal"
                      control={control}
                      render={({ field }) => (
                        <input type="color" id="colorPrincipal" {...field} />
                      )}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="colorSecundario">Color Secundario</label>
                  <div className="color-picker">
                    <Controller
                      name="colorSecundario"
                      control={control}
                      render={({ field }) => (
                        <input type="color" id="colorSecundario" {...field} />
                      )}
                    />
                  </div>
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
                  {...register("contrasena", {
                    required: "Este campo es obligatorio",
                    minLength: 8,
                  })}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.contrasena && (
                  <p className="error">{errors.contrasena.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmarContrasena">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="confirmarContrasena"
                  {...register("confirmarContrasena", {
                    required: "Este campo es obligatorio",
                    validate: (value) =>
                      value === watch("contrasena") ||
                      "Las contraseñas no coinciden",
                  })}
                  placeholder="Repite la contraseña"
                />
                {errors.confirmarContrasena && (
                  <p className="error">{errors.confirmarContrasena.message}</p>
                )}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="aceptaTerminos"
                {...register("aceptaTerminos", {
                  required: "Debe aceptar los términos y condiciones",
                })}
              />
              <label htmlFor="aceptaTerminos">
                Acepto los{" "}
                <Link to="/terminos" className="terms-link">
                  términos y condiciones
                </Link>{" "}
                de la plataforma *
              </label>
              {errors.aceptaTerminos && (
                <p className="error">{errors.aceptaTerminos.message}</p>
              )}
            </div>

            <p className="required-note">
              Nota: Todos los campos marcados con * son obligatorios.
            </p>

            <p className="form-note">
              Al enviar este formulario, su solicitud será revisada por un
              administrador del sistema para verificar los datos proporcionados.
              Este proceso puede tomar hasta 48 horas hábiles.
            </p>

            <div className="form-buttons">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                Enviar Solicitud de Registro
              </button>
              <Link to="/" className="cancel-button">
                Cancelar
              </Link>
            </div>
          </section>
        </form>
      </div>
      <Toaster position="top-left" reverseOrder={false} />
    </div>
  );
};

export default InstitutionRegisterPage;

"use client";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { Link } from "react-router-dom";
import Header from "../components/Header.tsx";
import "../styles/UserRegisterPage.css";
import { toast, Toaster } from "react-hot-toast";
import React, { useState } from "react";

interface FormValues {
  fullName: string;
  userType: string;
  institutionalMail: string;
  studentCode: string;
  document: string;
  institutionalCard: File | null;
  direction: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const UserRegisterPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fullName: "",
      userType: "student", // Cambiado a "student" para coincidir con el backend
      institutionalMail: "",
      studentCode: "",
      document: "",
      institutionalCard: null,
      direction: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    // Asegurarse de que el tipo de usuario sea uno de los permitidos en la base de datos
    let userType = data.userType;

    // Si el tipo seleccionado no es uno de los permitidos en la base de datos,
    // lo convertimos a "student" por defecto
    if (!["student", "driver", "admin"].includes(userType)) {
      userType = "student";
    }

    const form = new FormData();

    // Mapeo de campos del formulario a campos del backend
    form.append("full_name", data.fullName);
    form.append("user_type", userType);
    form.append("institutional_mail", data.institutionalMail);
    form.append("student_code", data.studentCode);
    form.append("udocument", data.document);

    if (data.institutionalCard) {
      form.append("institutional_carne", data.institutionalCard);
    }

    form.append("direction", data.direction);
    form.append("uphone", data.phone);
    form.append("upassword", data.password);

    // El institution_id se determinará en el backend basado en el correo institucional

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/register",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data);
      toast.success(
        "Registro enviado correctamente. Pendiente de aprobación por la institución.",
        {
          duration: 3000,
        }
      );

      setTimeout(() => {
        location.reload();
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error en el registro:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.message ||
            "Error al enviar el formulario. Inténtelo de nuevo."
        );
      } else {
        console.error("Error inesperado:", error);
        toast.error("Error inesperado. Inténtelo de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="user-register-container">
      <Header />

      <div className="register-form-container">
        <h1>Registro de Usuario</h1>
        <p className="form-description">
          Complete el siguiente formulario para registrarse como usuario en
          nuestra plataforma. Su solicitud será revisada por la institución a la
          que pertenece.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
          <section className="form-section">
            <h2>Información Personal</h2>

            <div className="form-group">
              <label htmlFor="fullName">Nombre Completo *</label>
              <input
                type="text"
                id="fullName"
                {...register("fullName", {
                  required: "Este campo es obligatorio",
                })}
                placeholder="Ingrese su nombre completo"
              />
              {errors.fullName && (
                <p className="error">{errors.fullName.message}</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="userType">Tipo de Usuario *</label>
                <select
                  id="userType"
                  {...register("userType", {
                    required: "Este campo es obligatorio",
                  })}
                >
                  <option value="student">Estudiante</option>
                  <option value="admin">Administrativo</option>
                  <option value="teacher">Profesor</option>
                  <option value="employee">Empleado</option>
                  <option value="other">Otro</option>
                </select>
                {errors.userType && <p className="error">{errors.userType.message}</p>}
                <p className="field-hint">Seleccione el tipo de usuario que mejor describe su rol en la institución.</p>
              </div>

              <div className="form-group">
                <label htmlFor="studentCode">
                  Código de Estudiante/Empleado *
                </label>
                <input
                  type="text"
                  id="studentCode"
                  {...register("studentCode", {
                    required: "Este campo es obligatorio",
                  })}
                  placeholder="Ingrese su código institucional"
                />
                {errors.studentCode && (
                  <p className="error">{errors.studentCode.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="institutionalMail">Correo Institucional *</label>
              <input
                type="email"
                id="institutionalMail"
                {...register("institutionalMail", {
                  required: "Este campo es obligatorio",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido",
                  },
                  validate: {
                    validDomain: (value) => {
                      const domain = value.split("@")[1];
                      return (
                        (domain && domain.includes(".")) ||
                        "El dominio del correo no parece válido"
                      );
                    },
                  },
                })}
                placeholder="correo@institucion.edu.co"
              />
              {errors.institutionalMail && (
                <p className="error">{errors.institutionalMail.message}</p>
              )}
              <p className="field-hint-important">
                El correo debe tener un dominio de una institución registrada y
                aprobada en nuestra plataforma (ej: @correounivalle.edu.co).
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="direction">Dirección *</label>
              <input
                type="text"
                id="direction"
                {...register("direction", {
                  required: "Este campo es obligatorio",
                })}
                placeholder="Ingrese su dirección completa"
              />
              {errors.direction && (
                <p className="error">{errors.direction.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                {...register("phone", {
                  required: "Este campo es obligatorio",
                })}
                placeholder="Ingrese su número de teléfono"
              />
              {errors.phone && <p className="error">{errors.phone.message}</p>}
            </div>
          </section>

          <section className="form-section">
            <h2>Documentos</h2>

            <div className="form-group">
              <label htmlFor="document">Documento de Identidad *</label>
              <input
                type="text"
                id="document"
                {...register("document", {
                  required: "Este campo es obligatorio",
                  pattern: {
                    value: /^\d{7,}$/,
                    message: "Debe ingresar al menos 7 dígitos numéricos",
                  },
                })}
                placeholder="Ingrese su número de documento (mínimo 7 dígitos)"
              />
              {errors.document && (
                <p className="error">{errors.document.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="institutionalCard">Carné Institucional *</label>
              <Controller
                name="institutionalCard"
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field }) => (
                  <input
                    type="file"
                    id="institutionalCard"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      field.onChange(e.target.files?.[0] || null)
                    }
                  />
                )}
              />
              {errors.institutionalCard && (
                <p className="error">{errors.institutionalCard.message}</p>
              )}
              <p className="field-hint">
                Suba una imagen de su carné institucional.
              </p>
            </div>
          </section>

          <section className="form-section">
            <h2>Seguridad</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  {...register("password", {
                    required: "Este campo es obligatorio",
                    minLength: {
                      value: 8,
                      message: "La contraseña debe tener al menos 8 caracteres",
                    },
                  })}
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && (
                  <p className="error">{errors.password.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword", {
                    required: "Este campo es obligatorio",
                    validate: (value) =>
                      value === watch("password") ||
                      "Las contraseñas no coinciden",
                  })}
                  placeholder="Repita la contraseña"
                />
                {errors.confirmPassword && (
                  <p className="error">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="acceptTerms"
                {...register("acceptTerms", {
                  required: "Debe aceptar los términos y condiciones",
                })}
              />
              <label htmlFor="acceptTerms">
                Acepto los{" "}
                <Link to="/terminos" className="terms-link">
                  términos y condiciones
                </Link>{" "}
                de la plataforma *
              </label>
              {errors.acceptTerms && (
                <p className="error">{errors.acceptTerms.message}</p>
              )}
            </div>

            <p className="required-note">
              Nota: Todos los campos marcados con * son obligatorios.
            </p>

            <p className="form-note">
              Al enviar este formulario, su solicitud será revisada por la
              institución a la que pertenece para verificar los datos
              proporcionados. Este proceso puede tomar hasta 48 horas hábiles.
            </p>

            <div className="form-buttons">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar Solicitud de Registro"}
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

export default UserRegisterPage;

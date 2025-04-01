"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Institution.module.css";

/**
 * Interfaz que define la estructura de los datos del formulario
 * Incluye todos los campos necesarios para el registro institucional
 */
interface FormData {
  officialName: string;
  shortName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  primaryColor: string;
  secondaryColor: string;
  password: string;
  confirmPassword: string;
  logo: File | null;
  termsAccepted: boolean;
}

/**
 * Componente principal de registro institucional
 * Maneja el estado del formulario, validación y envío de datos
 */
export default function InstitutionRegistration() {
  const router = useRouter(); // Hook para la navegación programática

  // Estado principal del formulario con valores iniciales
  const [formData, setFormData] = useState<FormData>({
    officialName: "",
    shortName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    primaryColor: "#6a5acd", // Color morado por defecto
    secondaryColor: "#ffffff", // Color blanco por defecto
    password: "",
    confirmPassword: "",
    logo: null,
    termsAccepted: false,
  });

  // Estado para la vista previa del logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Estado para almacenar errores de validación
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  // Estado para controlar si el formulario está siendo enviado
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para mensajes de éxito o error después del envío
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  /**
   * Maneja cambios en los campos de texto e inputs genéricos
   * Actualiza el estado del formulario y limpia errores existentes
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Limpia el error cuando el usuario empieza a corregir el campo
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  /**
   * Maneja cambios en los campos de tipo checkbox
   * Específicamente para la aceptación de términos
   */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  /**
   * Maneja la subida de archivos (logo)
   * Actualiza el estado y genera una vista previa
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        logo: file,
      });

      // Crea una vista previa del logo usando FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Valida todos los campos del formulario
   * Retorna true si no hay errores, false si hay errores
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Validaciones para cada campo requerido
    if (!formData.officialName.trim())
      newErrors.officialName = "El nombre oficial es requerido";

    // Validación de email con formato correcto
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    // Otras validaciones básicas
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.address.trim())
      newErrors.address = "La dirección es requerida";
    if (!formData.city.trim()) newErrors.city = "La ciudad es requerida";
    if (!formData.state.trim())
      newErrors.state = "El estado/provincia es requerido";

    // Validación de contraseña: longitud mínima
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    // Validación de coincidencia entre contraseñas
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validación de logo
    if (!formData.logo) {
      newErrors.logo = "El logo institucional es requerido";
    }

    // Validación de términos aceptados
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "Debes aceptar los términos y condiciones";
    }

    // Actualiza el estado de errores y retorna si hay errores o no
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario
   * Realiza validación y simula envío al servidor
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Valida el formulario antes de enviar
    if (!validateForm()) {
      // Si hay errores, hace scroll al primer error para que sea visible
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true); // Activa estado de envío

    try {
      // Simulación de envío al servidor con un delay
      // En producción, aquí iría la llamada real a la API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Muestra mensaje de éxito
      setSubmitMessage({
        type: "success",
        text: "Tu solicitud de registro ha sido enviada correctamente. Un administrador revisará tu información y se pondrá en contacto contigo pronto.",
      });

      // Opción para redirigir después del envío exitoso
      // Comentado pero disponible para implementar
      // setTimeout(() => router.push('/registro-exitoso'), 3000);
    } catch (error) {
      // Manejo de errores en caso de fallo en el envío
      setSubmitMessage({
        type: "error",
        text: "Ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente más tarde.",
      });
    } finally {
      setIsSubmitting(false); // Desactiva estado de envío
    }
  };

  // Renderizado del componente
  return (
    <div className={styles.container}>
      {/* Encabezado del formulario */}
      <div className={styles.header}>
        <h1>Registro de Institución</h1>
        <p>
          Complete el siguiente formulario para registrar su institución en
          nuestra plataforma. Un administrador validará su información para
          completar el proceso.
        </p>
      </div>

      {/* Mensaje de éxito o error después del envío */}
      {submitMessage && (
        <div className={`${styles.message} ${styles[submitMessage.type]}`}>
          {submitMessage.text}
        </div>
      )}

      {/* Formulario principal */}
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Sección 1: Información Institucional */}
        <div className={styles.formSection}>
          <h2>Información Institucional</h2>

          <div className={styles.formGrid}>
            {/* Campo para nombre oficial con validación */}
            <div
              className={styles.formGroup}
              data-error={!!errors.officialName}
            >
              <label htmlFor="officialName">
                Nombre Oficial de la Institución *
              </label>
              <input
                type="text"
                id="officialName"
                name="officialName"
                value={formData.officialName}
                onChange={handleInputChange}
                placeholder="Nombre oficial completo"
                className={errors.officialName ? styles.inputError : ""}
              />
              {errors.officialName && (
                <span className={styles.errorText}>{errors.officialName}</span>
              )}
            </div>

            {/* Campo para nombre corto (opcional) */}
            <div className={styles.formGroup}>
              <label htmlFor="shortName">Nombre Corto</label>
              <input
                type="text"
                id="shortName"
                name="shortName"
                value={formData.shortName}
                onChange={handleInputChange}
                placeholder="Acrónimo o nombre abreviado"
              />
            </div>
          </div>

          <div className={styles.formGrid}>
            {/* Campo para email con validación */}
            <div className={styles.formGroup} data-error={!!errors.email}>
              <label htmlFor="email">Correo Electrónico Institucional *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="correo@institucion.edu"
                className={errors.email ? styles.inputError : ""}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            {/* Campo para teléfono con validación */}
            <div className={styles.formGroup} data-error={!!errors.phone}>
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Número de teléfono institucional"
                className={errors.phone ? styles.inputError : ""}
              />
              {errors.phone && (
                <span className={styles.errorText}>{errors.phone}</span>
              )}
            </div>
          </div>

          {/* Campo para dirección con validación */}
          <div className={styles.formGroup} data-error={!!errors.address}>
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Dirección completa"
              className={errors.address ? styles.inputError : ""}
            />
            {errors.address && (
              <span className={styles.errorText}>{errors.address}</span>
            )}
          </div>

          <div className={styles.formGrid}>
            {/* Campo para ciudad con validación */}
            <div className={styles.formGroup} data-error={!!errors.city}>
              <label htmlFor="city">Ciudad *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Ciudad"
                className={errors.city ? styles.inputError : ""}
              />
              {errors.city && (
                <span className={styles.errorText}>{errors.city}</span>
              )}
            </div>

            {/* Campo para estado/provincia con validación */}
            <div className={styles.formGroup} data-error={!!errors.state}>
              <label htmlFor="state">Estado/Provincia *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Estado o provincia"
                className={errors.state ? styles.inputError : ""}
              />
              {errors.state && (
                <span className={styles.errorText}>{errors.state}</span>
              )}
            </div>

            {/* Campo para código postal (opcional) */}
            <div className={styles.formGroup}>
              <label htmlFor="zipCode">Código Postal</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="Código postal"
              />
            </div>
          </div>
        </div>

        {/* Sección 2: Identidad Visual */}
        <div className={styles.formSection}>
          <h2>Identidad Visual</h2>

          <div className={styles.formGrid}>
            {/* Campo para subir logo con vista previa */}
            <div className={styles.formGroup} data-error={!!errors.logo}>
              <label htmlFor="logo">Logo de la Institución *</label>
              <div className={styles.fileUpload}>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={errors.logo ? styles.inputError : ""}
                />
                <div className={styles.fileLabel}>
                  {formData.logo ? formData.logo.name : "Selecciona un archivo"}
                </div>
              </div>
              {errors.logo && (
                <span className={styles.errorText}>{errors.logo}</span>
              )}

              {/* Vista previa del logo cuando se sube un archivo */}
              {logoPreview && (
                <div className={styles.logoPreview}>
                  <h4>Vista previa:</h4>
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Vista previa del logo"
                  />
                </div>
              )}
            </div>

            {/* Selección de colores institucionales */}
            <div className={styles.formGroup}>
              <h4>Colores Institucionales</h4>
              <div className={styles.colorPicker}>
                {/* Selector de color principal */}
                <div>
                  <label htmlFor="primaryColor">Color Principal</label>
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleInputChange}
                  />
                  <span>{formData.primaryColor}</span>
                </div>

                {/* Selector de color secundario */}
                <div>
                  <label htmlFor="secondaryColor">Color Secundario</label>
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleInputChange}
                  />
                  <span>{formData.secondaryColor}</span>
                </div>
              </div>

              {/* Vista previa de los colores seleccionados */}
              <div className={styles.colorPreview}>
                <div style={{ background: formData.primaryColor }}>
                  Color Principal
                </div>
                <div
                  style={{ background: formData.secondaryColor, color: "#000" }}
                >
                  Color Secundario
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección 3: Seguridad */}
        <div className={styles.formSection}>
          <h2>Seguridad</h2>

          <div className={styles.formGrid}>
            {/* Campo para contraseña con validación */}
            <div className={styles.formGroup} data-error={!!errors.password}>
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mínimo 8 caracteres"
                className={errors.password ? styles.inputError : ""}
              />
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            {/* Campo para confirmar contraseña con validación */}
            <div
              className={styles.formGroup}
              data-error={!!errors.confirmPassword}
            >
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Repite la contraseña"
                className={errors.confirmPassword ? styles.inputError : ""}
              />
              {errors.confirmPassword && (
                <span className={styles.errorText}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sección 4: Términos y envío */}
        <div className={styles.formSection}>
          {/* Checkbox para aceptar términos y condiciones */}
          <div
            className={styles.termsGroup}
            data-error={!!errors.termsAccepted}
          >
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleCheckboxChange}
              />
              <span>
                Acepto los{" "}
                <Link href="/terminos" target="_blank">
                  términos y condiciones
                </Link>{" "}
                de la plataforma *
              </span>
            </label>
            {errors.termsAccepted && (
              <span className={styles.errorText}>{errors.termsAccepted}</span>
            )}
          </div>

          {/* Notas informativas del formulario */}
          <div className={styles.formNote}>
            <p>
              <strong>Nota:</strong> Todos los campos marcados con * son
              obligatorios.
            </p>
            <p>
              Al enviar este formulario, su solicitud será revisada por un
              administrador del sistema para verificar los datos proporcionados.
              Este proceso puede tomar hasta 48 horas hábiles.
            </p>
          </div>

          {/* Botones de acción */}
          <div className={styles.buttonGroup}>
            {/* Botón de envío con estado de carga */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud de Registro"}
            </button>

            {/* Botón de cancelar que redirige a la página principal */}
            <Link href="/" className={styles.cancelButton}>
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { DriverVehicle } from "../../../../types/driver.types"; // Asegúrate que esta ruta es correcta
import Button from "../common/Button";
// Puedes usar un archivo CSS específico o reutilizar uno existente
// import styles from './DriverVehicleForm.module.css';
import styles from "./DriverRouteForm.module.css"; // Reutilizando estilos de formulario base

interface DriverVehicleFormProps {
  // Ajustamos el tipo de formData para que coincida con los nuevos campos de DriverVehicle
  onSubmit: (formData: Omit<DriverVehicle, "id" | "imageUrl">) => Promise<void>;
  initialData?: Omit<DriverVehicle, "id" | "imageUrl">;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

// Opciones predefinidas (puedes expandirlas o cargarlas desde otro lado)
const vehicleCategories = [
  "Automóvil",
  "Motocicleta",
  "Camioneta",
  "Buseta",
  "Van",
  "Otro",
];
const vehicleTypesAutomovil = [
  "Sedán",
  "Hatchback",
  "SUV",
  "Coupé",
  "Convertible",
  "Otro",
];
const vehicleTypesMoto = [
  "Deportiva",
  "Crucero",
  "Doble Propósito",
  "Scooter",
  "Naked",
  "Enduro",
  "Motocross",
  "Otro",
];
// Podrías tener más arrays para otros tipos de categorías

const DriverVehicleForm: React.FC<DriverVehicleFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting = false,
  onCancel,
}) => {
  // Estados para los nuevos campos
  const [plate, setPlate] = useState(initialData?.plate || "");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [category, setCategory] = useState(
    initialData?.category || vehicleCategories[0]
  );
  const [vehicleType, setVehicleType] = useState(
    initialData?.vehicleType || ""
  );
  const [capacity, setCapacity] = useState<number | "">(
    initialData?.capacity || ""
  );
  const [soatExpirationDate, setSoatExpirationDate] = useState(
    initialData?.soat || ""
  );
  const [tecnoExpirationDate, setTecnoExpirationDate] = useState(
    initialData?.tecnomechanical || ""
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Efecto para actualizar el formulario si initialData cambia (para edición)
  useEffect(() => {
    if (initialData) {
      setPlate(initialData.plate || "");
      setBrand(initialData.brand || "");
      setModel(initialData.model || "");
      setCategory(initialData.category || vehicleCategories[0]);
      setVehicleType(initialData.vehicleType || "");
      setCapacity(initialData.capacity || "");
      setSoatExpirationDate(initialData.soat || "");
      setTecnoExpirationDate(initialData.tecnomechanical || "");
    } else {
      // Resetear para un formulario nuevo
      setPlate("");
      setBrand("");
      setModel("");
      setCategory(vehicleCategories[0]);
      setVehicleType("");
      setCapacity("");
      setSoatExpirationDate("");
      setTecnoExpirationDate("");
    }
  }, [initialData]);

  // Determinar qué tipos de vehículo mostrar basado en la categoría seleccionada
  const getCurrentVehicleTypes = () => {
    if (
      category === "Automóvil" ||
      category === "Camioneta" ||
      category === "Buseta" ||
      category === "Van"
    ) {
      return vehicleTypesAutomovil;
    } else if (category === "Motocicleta") {
      return vehicleTypesMoto;
    }
    return ["Otro"]; // O un array vacío si "Otro" no tiene tipos predefinidos
  };

  useEffect(() => {
    // Si la categoría cambia y el vehicleType actual no está en la nueva lista de tipos,
    // resetea vehicleType al primer tipo disponible o a vacío.
    const currentTypes = getCurrentVehicleTypes();
    if (!currentTypes.includes(vehicleType) && currentTypes.length > 0) {
      setVehicleType(currentTypes[0]);
    } else if (currentTypes.length === 0) {
      setVehicleType("");
    }
  }, [category, vehicleType]); // Añadí vehicleType a las dependencias

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!plate.trim()) newErrors.plate = "La placa es requerida.";
    // Validación de formato de placa (Colombia) - ajusta si es necesario
    else if (
      !/^[A-Z]{3}[\d]{3}$/i.test(plate.trim()) &&
      !/^[A-Z]{3}[\d]{2}[A-Z]$/i.test(plate.trim()) &&
      !/^[A-Z]{2}[\d]{3}[A-Z]$/i.test(plate.trim()) /*Motos nuevas*/
    ) {
      newErrors.plate =
        "Formato de placa inválido (Ej: AAA123, AAA12B, AA123B).";
    }
    if (!brand.trim()) newErrors.brand = "La marca es requerida.";
    if (!model.trim()) newErrors.model = "El modelo es requerido.";
    if (!category) newErrors.category = "La categoría es requerida.";
    if (!vehicleType && getCurrentVehicleTypes().length > 0)
      newErrors.vehicleType = "El tipo de vehículo es requerido.";
    if (capacity === "" || Number(capacity) <= 0)
      newErrors.capacity = "La capacidad debe ser un número mayor a 0.";
    // Validaciones opcionales para SOAT y Tecnomecánica
    if (
      soatExpirationDate &&
      new Date(soatExpirationDate) < new Date(new Date().toDateString())
    )
      newErrors.soatExpirationDate = "La fecha del SOAT no puede ser pasada.";
    if (
      tecnoExpirationDate &&
      new Date(tecnoExpirationDate) < new Date(new Date().toDateString())
    )
      newErrors.tecnoExpirationDate =
        "La fecha de la Tecnomecánica no puede ser pasada.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    await onSubmit({
      plate: plate.toUpperCase().trim(),
      brand,
      model,
      category,
      vehicleType,
      capacity: Number(capacity),
      soat: soatExpirationDate || undefined, // Envía undefined si está vacío
      tecnomechanical: tecnoExpirationDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <div className={styles.formGroup}>
        <label htmlFor="plate">Placa</label>
        <input
          type="text"
          id="plate"
          value={plate}
          onChange={(e) => {
            setPlate(e.target.value.toUpperCase());
            if (errors.plate) setErrors((prev) => ({ ...prev, plate: "" }));
          }}
          placeholder="Ej: ABC123"
          maxLength={6} // Común para placas
          className={errors.plate ? styles.inputError : ""}
          disabled={isSubmitting}
        />
        {errors.plate && <p className={styles.errorMessage}>{errors.plate}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="brand">Marca</label>
        <input
          type="text"
          id="brand"
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            if (errors.brand) setErrors((prev) => ({ ...prev, brand: "" }));
          }}
          placeholder="Ej: Chevrolet, Honda, Bajaj"
          className={errors.brand ? styles.inputError : ""}
          disabled={isSubmitting}
        />
        {errors.brand && <p className={styles.errorMessage}>{errors.brand}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="model">Modelo / Línea</label>
        <input
          type="text"
          id="model"
          value={model}
          onChange={(e) => {
            setModel(e.target.value);
            if (errors.model) setErrors((prev) => ({ ...prev, model: "" }));
          }}
          placeholder="Ej: Spark GT, CB190R, Pulsar NS200"
          className={errors.model ? styles.inputError : ""}
          disabled={isSubmitting}
        />
        {errors.model && <p className={styles.errorMessage}>{errors.model}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Categoría General</label>
        <select
          id="category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setVehicleType("");
            if (errors.category)
              setErrors((prev) => ({ ...prev, category: "" }));
          }}
          className={errors.category ? styles.inputError : ""}
          disabled={isSubmitting}
        >
          {vehicleCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className={styles.errorMessage}>{errors.category}</p>
        )}
      </div>

      {getCurrentVehicleTypes().length > 0 && (
        <div className={styles.formGroup}>
          <label htmlFor="vehicleType">Tipo de Vehículo (Específico)</label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => {
              setVehicleType(e.target.value);
              if (errors.vehicleType)
                setErrors((prev) => ({ ...prev, vehicleType: "" }));
            }}
            className={errors.vehicleType ? styles.inputError : ""}
            disabled={isSubmitting || getCurrentVehicleTypes().length === 0}
          >
            <option value="" disabled={vehicleType !== ""}>
              Seleccione un tipo
            </option>
            {getCurrentVehicleTypes().map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.vehicleType && (
            <p className={styles.errorMessage}>{errors.vehicleType}</p>
          )}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="capacity">
          Capacidad (No. Pasajeros sin incluir conductor)
        </label>
        <input
          type="number"
          id="capacity"
          value={capacity}
          onChange={(e) => {
            setCapacity(e.target.value === "" ? "" : Number(e.target.value));
            if (errors.capacity)
              setErrors((prev) => ({ ...prev, capacity: "" }));
          }}
          placeholder="Ej: 4"
          min="1"
          className={errors.capacity ? styles.inputError : ""}
          disabled={isSubmitting}
        />
        {errors.capacity && (
          <p className={styles.errorMessage}>{errors.capacity}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="soatExpirationDate">
          Fecha Vencimiento SOAT (Opcional)
        </label>
        <input
          type="date"
          id="soatExpirationDate"
          value={soatExpirationDate}
          onChange={(e) => {
            setSoatExpirationDate(e.target.value);
            if (errors.soatExpirationDate)
              setErrors((prev) => ({ ...prev, soatExpirationDate: "" }));
          }}
          className={errors.soatExpirationDate ? styles.inputError : ""}
          disabled={isSubmitting}
          min={new Date().toISOString().split("T")[0]} // No permite seleccionar fechas pasadas
        />
        {errors.soatExpirationDate && (
          <p className={styles.errorMessage}>{errors.soatExpirationDate}</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tecnoExpirationDate">
          Fecha Vencimiento Tecnomecánica (Opcional)
        </label>
        <input
          type="date"
          id="tecnoExpirationDate"
          value={tecnoExpirationDate}
          onChange={(e) => {
            setTecnoExpirationDate(e.target.value);
            if (errors.tecnoExpirationDate)
              setErrors((prev) => ({ ...prev, tecnoExpirationDate: "" }));
          }}
          className={errors.tecnoExpirationDate ? styles.inputError : ""}
          disabled={isSubmitting}
          min={new Date().toISOString().split("T")[0]} // No permite seleccionar fechas pasadas
        />
        {errors.tecnoExpirationDate && (
          <p className={styles.errorMessage}>{errors.tecnoExpirationDate}</p>
        )}
      </div>

      <div className={styles.formActions}>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? initialData
              ? "Guardando..."
              : "Agregando..."
            : initialData
            ? "Guardar Cambios"
            : "Agregar Vehículo"}
        </Button>
      </div>
    </form>
  );
};

export default DriverVehicleForm;

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react'; // Icono para el botón de cerrar
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;          // Controla si el modal está visible
  onClose: () => void;      // Función para cerrar el modal
  title?: string;           // Título opcional para el encabezado del modal
  children: React.ReactNode; // Contenido del modal (ej. un formulario)
  size?: 'small' | 'medium' | 'large' | 'xlarge'; // Tamaños predefinidos
  hideCloseButton?: boolean; // Opcional para ocultar el botón 'X'
  footer?: React.ReactNode; // Contenido opcional para el pie del modal
  // Añade más props si necesitas más personalización, ej. para estilos específicos del backdrop o contenido
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  hideCloseButton = false,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null); // Ref para el contenido del modal

  // Efecto para cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Enfocar el modal cuando se abre para accesibilidad (atrapar el foco)
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Efecto para evitar scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Limpiar el estilo al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null; // No renderizar nada si el modal no está abierto
  }

  // Función para manejar el clic en el backdrop (fondo oscuro)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Cierra el modal solo si el clic es directamente en el backdrop, no en sus hijos
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContentClasses = [
    styles.modalContent,
    styles[size], // Aplica la clase de tamaño, ej. styles.medium
  ].filter(Boolean).join(' ');

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      role="dialog" // Indica que es un diálogo
      aria-modal="true" // Indica que el contenido fuera del diálogo está inerte
      aria-labelledby={title ? "modal-title" : undefined} // Asocia el título con el diálogo
    >
      <div
        ref={modalRef}
        className={modalContentClasses}
        tabIndex={-1} // Permite que el div sea programáticamente enfocable
      >
        {(title || !hideCloseButton) && ( // Renderiza el header si hay título o no se oculta el botón X
          <div className={styles.modalHeader}>
            {title && <h2 id="modal-title" className={styles.modalTitle}>{title}</h2>}
            {!hideCloseButton && (
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Cerrar modal" // Importante para accesibilidad
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className={styles.modalBody}>
          {children}
        </div>
        {footer && (
          <div className={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
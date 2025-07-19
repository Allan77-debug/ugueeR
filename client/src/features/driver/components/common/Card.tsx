import React from 'react';
import styles from './Card.module.css'; // Asegúrate que la importación sea correcta

interface CardProps {
  children: React.ReactNode;
  className?: string; // Para pasar clases CSS adicionales desde el componente padre
  onClick?: () => void; // Para hacer la tarjeta clickeable
  // Puedes añadir más props si necesitas variantes, ej: conPadding, sinSombra, etc.
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  const cardClasses = [
    styles.cardBase, // Clase base de la tarjeta
    onClick ? styles.clickable : '', // Clase si es clickeable
    className, // Clases adicionales pasadas como prop
  ]
    .filter(Boolean) // Elimina cualquier string vacío o nulo del array
    .join(' ');     // Une las clases en un solo string

  return (
    <div className={cardClasses} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {children}
    </div>
  );
};

export default Card;
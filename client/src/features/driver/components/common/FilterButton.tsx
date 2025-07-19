import React from 'react';
import { Filter } from 'lucide-react';
import Button from './Button'; // Reutilizamos nuestro componente Button
import styles from './FilterButton.module.css'; // Aún podemos tener estilos específicos si es necesario

interface FilterButtonProps {
  onClick: () => void;
  isActive?: boolean; // Para cambiar su apariencia si los filtros están activos/visibles
  children?: React.ReactNode; // Para personalizar el texto si es necesario
}

const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  isActive = false,
  children = 'Filtros',
}) => {
  // Usamos el componente Button como base
  return (
    <Button
      onClick={onClick}
      variant={isActive ? 'primary' : 'default'} // Cambia variante si está activo
      leftIcon={<Filter size={18} />}
      className={`${styles.filterButtonBase} ${isActive ? styles.active : ''}`}
    >
      {children}
    </Button>
  );
};

export default FilterButton;
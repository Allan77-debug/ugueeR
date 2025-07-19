import React, { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  ...props
}) => {
  const containerClasses = [
    styles.searchContainer,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <Search size={18} className={styles.searchIcon} />
      <input
        type="search" // 'search' type a veces añade un botón 'x' nativo
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.searchInput}
        {...props}
      />
    </div>
  );
};

export default SearchBar;
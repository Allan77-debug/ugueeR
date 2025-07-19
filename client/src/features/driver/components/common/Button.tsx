import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant], // e.g., styles.primary
    styles[size],   // e.g., styles.medium
    fullWidth ? styles.fullWidth : '',
    className,      // Para clases adicionales pasadas desde fuera
  ]
    .filter(Boolean) // Elimina strings vacíos
    .join(' ');

  return (
    <button className={buttonClasses} {...props}>
      {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
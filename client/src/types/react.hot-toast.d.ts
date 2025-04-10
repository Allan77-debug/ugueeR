declare module 'react-hot-toast' {
    import React from 'react';
  
    export interface ToastOptions {
      duration?: number;
      position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
      style?: React.CSSProperties;
      className?: string;
      icon?: React.ReactNode;
      id?: string;
      ariaProps?: {
        role: string;
        'aria-live': string;
        'aria-atomic': string;
      };
      iconTheme?: {
        primary: string;
        secondary: string;
      };
    }
  
    export interface Toast {
      id: string;
      type: string;
      message: string | React.ReactNode;
      icon?: React.ReactNode;
      duration?: number;
      position?: string;
      style?: React.CSSProperties;
      className?: string;
      ariaProps: {
        role: string;
        'aria-live': string;
        'aria-atomic': string;
      };
      visible: boolean;
      createdAt: number;
      iconTheme?: {
        primary: string;
        secondary: string;
      };
    }
  
    export interface ToasterProps {
      position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
      toastOptions?: ToastOptions;
      reverseOrder?: boolean;
      gutter?: number;
      containerStyle?: React.CSSProperties;
      containerClassName?: string;
      children?: (toast: Toast) => React.ReactNode;
    }
  
    export const Toaster: React.FC<ToasterProps>;
  
    export function toast(message: string | React.ReactNode, options?: ToastOptions): string;
    export function toast(component: (t: { id: string; visible: boolean }) => React.ReactNode, options?: ToastOptions): string;
  
    export function useToaster(): {
      toasts: Toast[];
      handlers: {
        startPause: () => void;
        endPause: () => void;
        updateHeight: (id: string, height: number) => void;
        updateToast: (toast: Toast) => void;
        addToast: (toast: Toast) => void;
        dismissToast: (id: string) => void;
      };
    };
  
    export namespace toast {
      function success(message: string | React.ReactNode, options?: ToastOptions): string;
      function error(message: string | React.ReactNode, options?: ToastOptions): string;
      function loading(message: string | React.ReactNode, options?: ToastOptions): string;
      function custom(message: string | React.ReactNode, options?: ToastOptions): string;
      function dismiss(toastId?: string): void;
      function remove(toastId: string): void;
      function promise<T>(
        promise: Promise<T>,
        msgs: {
          loading: string | React.ReactNode;
          success: string | React.ReactNode | ((data: T) => string | React.ReactNode);
          error: string | React.ReactNode | ((err: unknown) => string | React.ReactNode);
        },
        opts?: ToastOptions
      ): Promise<T>;
    }
  }
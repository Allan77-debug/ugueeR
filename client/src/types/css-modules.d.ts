// src/css-modules.d.ts
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Opcionalmente, si también usas .module.scss o .module.sass
declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

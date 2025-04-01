export type InstitutionStatus = "pendiente" | "aprobada" | "rechazada"

export interface Institution {
  id: string
  name: string
  shortName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  logo: string
  primaryColor: string
  secondaryColor: string
  status: InstitutionStatus
  applicationDate: string
  location: string
  rejectionReason?: string
}

export interface InstitutionRole {
  id: string
  name: string
  permissions: string[]
}


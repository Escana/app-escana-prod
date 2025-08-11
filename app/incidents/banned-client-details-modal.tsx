"use client"

import type React from "react"

interface BannedClientDetailsModalProps {
  client: {
    id: string
    name: string
    email: string
    phone_number: string
    address: string
    document_photo_url?: string // Make it optional to avoid errors if it's not always present
    reason: string
    nationality?: string // Add nationality field
    age?: number // Add age field
  }
  onClose: () => void
}

const BannedClientDetailsModal: React.FC<BannedClientDetailsModalProps> = ({ client, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles del Cliente Bloqueado</h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">Aquí están los detalles del cliente bloqueado.</p>
          </div>
          <div className="px-4 py-3 text-left">
            <p>
              <strong>ID:</strong> {client.id}
            </p>
            <p>
              <strong>Nacionalidad:</strong> {client.nationality || "No especificada"}
            </p>
            <p>
              <strong>Edad:</strong> {client.age || "No especificada"}
            </p>
            <p>
              <strong>Nombre:</strong> {client.name}
            </p>
            <p>
              <strong>Email:</strong> {client.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {client.phone_number}
            </p>
            <p>
              <strong>Dirección:</strong> {client.address}
            </p>
            <p>
              <strong>Razón:</strong> {client.reason}
            </p>
          </div>
          <div className="items-center px-4 py-3">
            <button
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BannedClientDetailsModal


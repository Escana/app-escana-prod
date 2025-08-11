import LocalsTableDemo from "../components/locals-table-demo"

export default function DemoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Demostración de Tabla de Locales</h1>
        <p className="text-muted-foreground">Visualización de datos de ejemplo para la tabla de gestión de locales.</p>
      </div>

      <LocalsTableDemo />
    </div>
  )
}


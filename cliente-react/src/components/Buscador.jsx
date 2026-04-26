function Buscador({ onAgregar }) {
// Función que viene del componente padre (App) para que los componentes se comuniquen entre sí
    return (
    <div>
        <input
        id="campoBusqueda"
        type="text"
        placeholder="Escribe o escanea el código..."
        />
        <button onClick={onAgregar}>
        Agregar producto
        </button>
    </div>
    )
}

export default Buscador
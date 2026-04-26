function Ticket({ carrito, total, refTicket }) {
  return (
    <div ref={refTicket} style={{ padding: "20px", fontFamily: "monospace" }}>
      <h2>Farmacia Rocío</h2>
      <hr />
      {carrito.map(function(producto) {
        const subtotal = producto.precio * producto.cantidad
        return (
          <p key={producto.codigo}>
            {producto.nombre} x{producto.cantidad} → ${subtotal}
          </p>
        )
      })}
      <hr />
      <h3>TOTAL: ${total}</h3>
      <p>¡Gracias por su compra!</p>
    </div>
  )
}

export default Ticket
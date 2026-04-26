const express = require("express")
const cors = require("cors")
const xlsx = require("xlsx")
const multer = require("multer")
const fs = require("fs")
const db = require("./database")

const app = express()
const upload = multer({ dest: "uploads/" })

app.use(express.json())
app.use(cors())

// ─────────────────────────────────────
// FUNCIÓN DE ACTIVIDAD
// ─────────────────────────────────────
function registrarActividad(usuario, accion, detalle) {
  db.prepare(`
    INSERT INTO actividad (usuario, accion, detalle, fecha)
    VALUES (?, ?, ?, ?)
  `).run(usuario, accion, detalle, new Date().toISOString())
}

// ─────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────

app.get("/productos", function(req, res) {
  const productos = db.prepare("SELECT * FROM productos").all()
  res.json(productos)
})

app.get("/productos/buscar/:codigo", function(req, res) {
  const producto = db.prepare("SELECT * FROM productos WHERE codigo = ?").get(req.params.codigo)
  if (producto) {
    res.json({ existe: true, producto: producto })
  } else {
    res.json({ existe: false, codigo: req.params.codigo })
  }
})

app.post("/productos", function(req, res) {
  const { codigo, nombre, gramaje, laboratorio, precio, usuario } = req.body
  try {
    const resultado = db.prepare(`
      INSERT INTO productos (codigo, nombre, gramaje, laboratorio, precio)
      VALUES (?, ?, ?, ?, ?)
    `).run(codigo, nombre, gramaje || "", laboratorio || "", precio)

    registrarActividad(
      usuario || "admin",
      "AGREGAR_PRODUCTO",
      `Agregó producto: ${nombre} (${codigo})`
    )

    res.json({ mensaje: "Producto agregado ✅", id: resultado.lastInsertRowid })
  } catch(e) {
    res.json({ error: "El código ya existe" })
  }
})

app.put("/productos/:id", function(req, res) {
  const { nombre, gramaje, laboratorio, precio, usuario } = req.body
  db.prepare(`
    UPDATE productos SET nombre = ?, gramaje = ?, laboratorio = ?, precio = ? WHERE id = ?
  `).run(nombre, gramaje || "", laboratorio || "", precio, req.params.id)

  registrarActividad(
    usuario || "admin",
    "EDITAR_PRODUCTO",
    `Editó producto: ${nombre}`
  )

  res.json({ mensaje: "Producto actualizado ✅" })
})

app.delete("/productos/:id", function(req, res) {
  const { usuario } = req.body
  const producto = db.prepare("SELECT * FROM productos WHERE id = ?").get(req.params.id)
  db.prepare("DELETE FROM productos WHERE id = ?").run(req.params.id)

  registrarActividad(
    usuario || "admin",
    "ELIMINAR_PRODUCTO",
    `Eliminó producto: ${producto.nombre} (${producto.codigo})`
  )

  res.json({ mensaje: "Producto eliminado ✅" })
})

app.post("/productos/importar", upload.single("archivo"), function(req, res) {
  const archivo = req.file
  if (!archivo) return res.json({ error: "No se subió ningún archivo" })

  const workbook = xlsx.readFile(archivo.path)
  const hoja = workbook.Sheets[workbook.SheetNames[0]]
  const filas = xlsx.utils.sheet_to_json(hoja)

  const insertar = db.prepare(`
    INSERT OR IGNORE INTO productos (codigo, nombre, gramaje, laboratorio, precio, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  let insertados = 0
  let ignorados = 0

  filas.forEach(function(fila) {
    if (!fila.codigo || !fila.nombre || !fila.precio) return
    const resultado = insertar.run(
      String(fila.codigo),
      String(fila.nombre),
      String(fila.gramaje || ""),
      String(fila.laboratorio || ""),
      Number(fila.precio),
      Number(fila.stock || 0)
    )
    if (resultado.changes > 0) insertados++
    else ignorados++
  })

  fs.unlinkSync(archivo.path)
  res.json({ mensaje: "Importación completada ✅", insertados, ignorados })
})

// ─────────────────────────────────────
// VENTAS
// ─────────────────────────────────────

app.post("/ventas", function(req, res) {
  const { total, productos, usuario } = req.body
  const fecha = new Date().toISOString()

  const resultado = db.prepare(`
    INSERT INTO ventas (total, fecha) VALUES (?, ?)
  `).run(total, fecha)

  const ventaId = resultado.lastInsertRowid

  const insertarDetalle = db.prepare(`
    INSERT INTO detalle_ventas (venta_id, codigo, nombre, gramaje, laboratorio, precio, cantidad, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const descontarStock = db.prepare(`
    UPDATE productos SET stock = stock - ? WHERE codigo = ?
  `)

  productos.forEach(function(producto) {
    insertarDetalle.run(
      ventaId,
      producto.codigo,
      producto.nombre,
      producto.gramaje || "",
      producto.laboratorio || "",
      producto.precio,
      producto.cantidad,
      producto.precio * producto.cantidad
    )
    descontarStock.run(producto.cantidad, producto.codigo)
  })

  registrarActividad(
    usuario || "sistema",
    "VENTA",
    `Venta #${ventaId} por $${total}`
  )

  res.json({ mensaje: "Venta guardada ✅", id: ventaId })
})

app.get("/ventas", function(req, res) {
  const ventas = db.prepare("SELECT * FROM ventas ORDER BY fecha DESC").all()
  res.json(ventas)
})

app.get("/ventas/:id/detalle", function(req, res) {
  const detalle = db.prepare(`
    SELECT * FROM detalle_ventas WHERE venta_id = ?
  `).all(req.params.id)
  res.json(detalle)
})

app.delete("/ventas/:id", function(req, res) {
  const { usuario } = req.body
  const venta = db.prepare("SELECT * FROM ventas WHERE id = ?").get(req.params.id)

  if (!venta) return res.json({ error: "Venta no encontrada" })

  db.prepare("DELETE FROM ventas WHERE id = ?").run(req.params.id)

  registrarActividad(
    usuario || "admin",
    "CANCELAR_VENTA",
    `Canceló venta #${req.params.id} por $${venta.total}`
  )

  res.json({ mensaje: "Venta cancelada ✅" })
})

// ─────────────────────────────────────
// INVENTARIO
// ─────────────────────────────────────

app.get("/inventario", function(req, res) {
  const productos = db.prepare("SELECT * FROM productos ORDER BY stock ASC").all()
  res.json(productos)
})

app.put("/inventario/:id", function(req, res) {
  const { stock, usuario } = req.body
  const producto = db.prepare("SELECT * FROM productos WHERE id = ?").get(req.params.id)

  db.prepare("UPDATE productos SET stock = ? WHERE id = ?").run(stock, req.params.id)

  registrarActividad(
    usuario || "admin",
    "ACTUALIZAR_STOCK",
    `Actualizó stock de ${producto.nombre} a ${stock}`
  )

  res.json({ mensaje: "Stock actualizado ✅" })
})

// ─────────────────────────────────────
// CAJA
// ─────────────────────────────────────

app.get("/caja", function(req, res) {
  const hoy = new Date().toISOString().split("T")[0]
  const ventas = db.prepare("SELECT * FROM ventas WHERE fecha LIKE ?").all(hoy + "%")
  const total = ventas.reduce(function(suma, v) { return suma + v.total }, 0)

  res.json({
    fecha: hoy,
    numeroVentas: ventas.length,
    totalVentas: total,
    ventas: ventas
  })
})

// ─────────────────────────────────────
// REPORTES
// ─────────────────────────────────────

app.get("/reportes/:inicio/:fin", function(req, res) {
  const { inicio, fin } = req.params
  const ventas = db.prepare(`
    SELECT * FROM ventas WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC
  `).all(inicio, fin + "T23:59:59.999Z")

  const total = ventas.reduce(function(suma, v) { return suma + v.total }, 0)

  res.json({
    ventas: ventas,
    totalVentas: ventas.length,
    totalDinero: total
  })
})

// ─────────────────────────────────────
// LOGIN Y USUARIOS
// ─────────────────────────────────────

app.post("/login", function(req, res) {
  const { usuario, password } = req.body
  const user = db.prepare(`
    SELECT * FROM usuarios WHERE usuario = ? AND password = ?
  `).get(usuario, password)

  if (user) {
    registrarActividad(user.usuario, "LOGIN", `Inició sesión`)
    res.json({
      ok: true,
      usuario: { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol }
    })
  } else {
    res.json({ ok: false, mensaje: "Usuario o contraseña incorrectos" })
  }
})

app.get("/usuarios", function(req, res) {
  const usuarios = db.prepare("SELECT id, nombre, usuario, rol FROM usuarios").all()
  res.json(usuarios)
})

app.post("/usuarios", function(req, res) {
  const { nombre, usuario, password, rol } = req.body
  try {
    const resultado = db.prepare(`
      INSERT INTO usuarios (nombre, usuario, password, rol) VALUES (?, ?, ?, ?)
    `).run(nombre, usuario, password, rol)
    res.json({ mensaje: "Usuario creado ✅", id: resultado.lastInsertRowid })
  } catch(e) {
    res.json({ error: "El usuario ya existe" })
  }
})

app.delete("/usuarios/:id", function(req, res) {
  db.prepare("DELETE FROM usuarios WHERE id = ?").run(req.params.id)
  res.json({ mensaje: "Usuario eliminado ✅" })
})

// ─────────────────────────────────────
// ACTIVIDAD
// ─────────────────────────────────────

app.get("/actividad", function(req, res) {
  const actividad = db.prepare(`
    SELECT * FROM actividad ORDER BY fecha DESC LIMIT 100
  `).all()
  res.json(actividad)
})

// ─────────────────────────────────────
// SERVIDOR
// ─────────────────────────────────────

const PUERTO = 3000

app.listen(PUERTO, function() {
  console.log("Servidor corriendo en http://localhost:" + PUERTO)
})
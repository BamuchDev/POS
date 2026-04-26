const Database = require("better-sqlite3")
const path = require("path")

const rutaDB = path.join(__dirname, "farmacia.db")
const db = new Database(rutaDB)

// tabla de productos
db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo       TEXT    NOT NULL UNIQUE,
    nombre       TEXT    NOT NULL,
    gramaje      TEXT    DEFAULT '',
    laboratorio  TEXT    DEFAULT '',
    precio       REAL    NOT NULL,
    stock        INTEGER NOT NULL DEFAULT 0
  )
`)

// tabla de ventas
db.exec(`
  CREATE TABLE IF NOT EXISTS ventas (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    total  REAL    NOT NULL,
    fecha  TEXT    NOT NULL
  )
`)

// agregar columnas nuevas si no existen (para bases de datos ya creadas)
try {
  db.exec("ALTER TABLE productos ADD COLUMN stock INTEGER NOT NULL DEFAULT 0")
} catch(e) {}

try {
  db.exec("ALTER TABLE productos ADD COLUMN gramaje TEXT DEFAULT ''")
} catch(e) {}

try {
  db.exec("ALTER TABLE productos ADD COLUMN laboratorio TEXT DEFAULT ''")
} catch(e) {}

// insertar productos de prueba solo si la tabla está vacía
const cantidad = db.prepare("SELECT COUNT(*) as total FROM productos").get()

if (cantidad.total === 0) {
  const insertar = db.prepare(`
    INSERT INTO productos (codigo, nombre, gramaje, laboratorio, precio) 
    VALUES (?, ?, ?, ?, ?)
  `)

  insertar.run("001", "Paracetamol", "500mg", "Maver", 20)
  insertar.run("002", "Omeprazol", "20mg", "Pisa", 35)
  insertar.run("003", "Ibuprofeno", "400mg", "Collins", 25)

  console.log("Productos de prueba insertados ✅")
}

// tabla de usuarios
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre   TEXT    NOT NULL,
    usuario  TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL,
    rol      TEXT    NOT NULL DEFAULT 'empleado'
  )
`)

// crear admin por defecto si no existe
const adminExiste = db.prepare("SELECT COUNT(*) as total FROM usuarios").get()

if (adminExiste.total === 0) {
  db.prepare(`
    INSERT INTO usuarios (nombre, usuario, password, rol)
    VALUES (?, ?, ?, ?)
  `).run("Administrador", "admin", "admin123", "admin")

  console.log("Usuario admin creado ✅")
  console.log("Usuario: admin | Contraseña: admin123")
}

// tabla de log de actividad
db.exec(`
  CREATE TABLE IF NOT EXISTS actividad (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario  TEXT    NOT NULL,
    accion   TEXT    NOT NULL,
    detalle  TEXT,
    fecha    TEXT    NOT NULL
  )
`)

// tabla de detalle de ventas
db.exec(`
  CREATE TABLE IF NOT EXISTS detalle_ventas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id     INTEGER NOT NULL,
    codigo       TEXT    NOT NULL,
    nombre       TEXT    NOT NULL,
    gramaje      TEXT    DEFAULT '',
    laboratorio  TEXT    DEFAULT '',
    precio       REAL    NOT NULL,
    cantidad     INTEGER NOT NULL,
    subtotal     REAL    NOT NULL
  )
`)

console.log("Base de datos lista ✅")

module.exports = db
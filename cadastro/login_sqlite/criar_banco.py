import sqlite3

conn = sqlite3.connect("cadastro/login_sqlite/usuarios.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS usuarios (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo_perfil TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    rg TEXT,
    whatsapp TEXT NOT NULL
)
""")

conn.commit()
conn.close()
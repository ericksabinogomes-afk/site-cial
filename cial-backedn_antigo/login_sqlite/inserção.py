import sqlite3

conn = sqlite3.connect("cadastro/login_sqlite/usuarios.db")
cursor = conn.cursor()

cursor.execute("""
    INSERT INTO usuarios (nome, tipo_perfil, email, senha_hash, rg, whatsapp)
VALUES (?, ?, ?, ?, ?, ?)
    """,(
        "Felipe",
        "PF",
        "felipe@exemplo",
        "hash_fake",
        "12",
        "619999999"
))


conn.commit()
conn.close()
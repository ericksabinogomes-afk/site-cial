import sqlite3

conn = conn = sqlite3.connect("cadastro/login_sqlite/usuarios.db")
cursor = conn.cursor()

cursor.execute("""
    SELECT * FROM usuarios
""")

usuarios = cursor.fetchall()

for usuarios in usuarios:
    print(usuarios)

conn.close()
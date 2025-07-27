# generate_certs.py (versión final, final, corregida)
import trustme
import os

# Crea un directorio 'certs' si no existe
certs_dir = "certs"
if not os.path.exists(certs_dir):
    os.makedirs(certs_dir)

print("Generando autoridad de certificación local...")
ca = trustme.CA()

print("Generando certificado para localhost y tu IP...")
# Añade aquí la IP de tu PC para que el certificado sea válido para ella
server_cert = ca.issue_server_cert("localhost", "127.0.0.1", "10.168.58.145")

# Guarda los archivos
ca_cert_path = os.path.join(certs_dir, "ca.pem")
server_cert_path = os.path.join(certs_dir, "server.pem")
server_key_path = os.path.join(certs_dir, "server.key")

ca.cert_pem.write_to_path(ca_cert_path)
server_cert.private_key_pem.write_to_path(server_key_path)

# La forma correcta de escribir la cadena de certificados (que es una lista de objetos Blob)
with open(server_cert_path, "wb") as f:
    for cert_pem in server_cert.cert_chain_pems:
        # Cada 'cert_pem' es un objeto Blob, lo convertimos a bytes antes de escribir
        f.write(cert_pem.bytes())

print(f"\n¡Certificados generados en la carpeta '{certs_dir}'!")
print("Ahora necesitas confiar en la CA. En Windows, puedes hacerlo con:")
print(f"certutil -addstore -f \"ROOT\" \"{os.path.join(os.getcwd(), certs_dir, 'ca.pem')}\"")
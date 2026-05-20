import os
import re
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

def main():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    
    priv = key.private_bytes(
        encoding=serialization.Encoding.PEM, 
        format=serialization.PrivateFormat.PKCS8, 
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    pub = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM, 
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    priv_str = priv.replace('\n', '\\n')
    pub_str = pub.replace('\n', '\\n')
    
    env_path = '.env'
    if not os.path.exists(env_path):
        print(".env not found")
        return
        
    content = open(env_path).read()
    
    content = re.sub(r'JWT_PRIVATE_KEY=".*?"', f'JWT_PRIVATE_KEY="{priv_str}"', content, flags=re.DOTALL)
    content = re.sub(r'JWT_PUBLIC_KEY=".*?"', f'JWT_PUBLIC_KEY="{pub_str}"', content, flags=re.DOTALL)
    
    open(env_path, 'w').write(content)
    print("RSA keys successfully generated and written to .env!")

if __name__ == "__main__":
    main()

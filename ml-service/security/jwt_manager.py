import os
import jwt

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev_secret_key")
if not JWT_SECRET_KEY:
	raise RuntimeError("JWT_SECRET_KEY não definida no ambiente!")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
	raise RuntimeError("JWT_SECRET_KEY não definida no ambiente!")

ALGORITHM = "HS256"

class TokenPair:
	def __init__(self, access_token, refresh_token, expires_in):
		self.access_token = access_token
		self.refresh_token = refresh_token
		self.expires_in = expires_in

class JWTManager:
	@staticmethod
	def generate_tokens(user_id, email):
		access_payload = {
			"user_id": user_id,
			"email": email,
			"token_type": "access",
			"exp": datetime.utcnow() + timedelta(minutes=15)
		}
		refresh_payload = {
			"user_id": user_id,
			"email": email,
			"token_type": "refresh",
			"exp": datetime.utcnow() + timedelta(days=7)
		}
		access_token = jwt.encode(access_payload, JWT_SECRET_KEY, algorithm=ALGORITHM)
		refresh_token = jwt.encode(refresh_payload, JWT_SECRET_KEY, algorithm=ALGORITHM)
		return TokenPair(access_token, refresh_token, 900)

	@staticmethod
	def generate_access_token(user_id, email):
		payload = {
			"user_id": user_id,
			"email": email,
			"token_type": "access",
			"exp": datetime.utcnow() + timedelta(minutes=15)
		}
		return jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)

	@staticmethod
	def verify_token(token):
		try:
			payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
			return type('Payload', (), payload)
		except jwt.ExpiredSignatureError:
			return None
		except jwt.InvalidTokenError:
			return None

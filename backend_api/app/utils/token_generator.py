import uuid

def generate_token() -> str:
    """Generate a unique UUID token"""
    return str(uuid.uuid4())

def generate_auth_key() -> str:
    """Generate a unique auth key for users"""
    return str(uuid.uuid4())
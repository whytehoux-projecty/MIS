import secrets

def generate_pin(length: int = 6) -> str:
    """
    Generate a cryptographically secure random PIN.
    
    Uses secrets module which is suitable for generating
    security-sensitive tokens and passwords.
    
    Args:
        length: Number of digits in the PIN (default: 6)
    
    Returns:
        String of random digits with leading zeros preserved
    """
    max_value = 10 ** length
    return f"{secrets.randbelow(max_value):0{length}d}"
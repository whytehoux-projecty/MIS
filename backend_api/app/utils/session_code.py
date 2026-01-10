import secrets
import string
import random

def generate_session_code(length: int = 20) -> str:
    """
    Generate a secure random alphanumeric session code.
    Example: aB3dE9fG2hI5jK8lM1nO
    """
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_obfuscation_map(length: int = 20, hidden_count: int = 10) -> dict:
    """
    Generate a map of positions to hide.
    Returns: {"hidden_indices": [2, 5, ...], "visible_indices": [0, 1, ...]}
    """
    if hidden_count > length:
        raise ValueError("Hidden count cannot exceed length")
        
    indices = list(range(length))
    hidden_indices = sorted(random.sample(indices, hidden_count))
    visible_indices = sorted([i for i in indices if i not in hidden_indices])
    
    return {
        "hidden_indices": hidden_indices,
        "visible_indices": visible_indices
    }

def apply_obfuscation(code: str, obfuscation_map: dict) -> str:
    """
    Apply 'X' mask to the code based on the map.
    """
    chars = list(code)
    for idx in obfuscation_map["hidden_indices"]:
        if 0 <= idx < len(chars):
            chars[idx] = 'X'
    return "".join(chars)

def validate_scanned_pattern(scanned_pattern: str, stored_code: str, obfuscation_map: dict) -> bool:
    """
    Validate that a scanned pattern matches the stored session code.
    
    The scanned pattern should have 'X' in the hidden positions and
    the correct visible characters in the visible positions.
    
    Args:
        scanned_pattern: The pattern from the scanned QR code
        stored_code: The original full session code
        obfuscation_map: The map showing which positions are hidden
        
    Returns:
        bool: True if the pattern is valid, False otherwise
    """
    if not scanned_pattern or not stored_code or not obfuscation_map:
        return False
        
    if len(scanned_pattern) != len(stored_code):
        return False
    
    hidden_indices = set(obfuscation_map.get("hidden_indices", []))
    
    for i, (scanned_char, original_char) in enumerate(zip(scanned_pattern, stored_code)):
        if i in hidden_indices:
            # Hidden positions must be 'X' in the scanned pattern
            if scanned_char != 'X':
                return False
        else:
            # Visible positions must match the original code
            if scanned_char != original_char:
                return False
    
    return True


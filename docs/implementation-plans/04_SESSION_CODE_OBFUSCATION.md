# 🔐 Session Code Obfuscation Plan

> **Document ID:** PLAN-04  
> **Priority:** 🟡 High  
> **Phase:** 2  
> **Estimated Effort:** 1-2 days  
> **Dependencies:** Database schema alignment (PLAN-03)

---

## 📋 Overview

Implement session code obfuscation as documented in `login_logic_flow.md`:

```
Original Session Code:  q1W2E3r4T5Y6u7I8o9p0  (20 chars)
Obfuscated QR Pattern:  q1XXX3X4TXX6uXI8X9XX  (10 visible, 10 hidden)
```

---

## 🎯 Objectives

1. Generate 20-character session codes
2. Implement random position obfuscation
3. Store obfuscation map for validation
4. Validate scanned QR against stored pattern

---

## 🛠️ Implementation

### File: `app/utils/session_code.py`

```python
import secrets
import string
from typing import Tuple, Dict, List

SESSION_CODE_CHARS = string.ascii_letters + string.digits + "!@#$%"
SESSION_CODE_LENGTH = 20
HIDDEN_POSITIONS_COUNT = 10

def generate_session_code() -> str:
    """Generate 20-char cryptographically secure session code."""
    return ''.join(secrets.choice(SESSION_CODE_CHARS) for _ in range(SESSION_CODE_LENGTH))

def generate_obfuscation_positions() -> List[int]:
    """Random 10 positions to hide."""
    return sorted(secrets.SystemRandom().sample(range(SESSION_CODE_LENGTH), HIDDEN_POSITIONS_COUNT))

def create_obfuscated_pattern(session_code: str, hidden_positions: List[int]) -> str:
    """Replace hidden positions with 'X'."""
    result = list(session_code)
    for pos in hidden_positions:
        result[pos] = 'X'
    return ''.join(result)

def generate_session_with_obfuscation() -> Tuple[str, str, Dict]:
    """Generate full session with obfuscation."""
    session_code = generate_session_code()
    hidden_positions = generate_obfuscation_positions()
    qr_pattern = create_obfuscated_pattern(session_code, hidden_positions)
    
    obfuscation_map = {
        "hidden_positions": hidden_positions,
        "visible_positions": [i for i in range(SESSION_CODE_LENGTH) if i not in hidden_positions],
        "mask_char": "X"
    }
    
    return session_code, qr_pattern, obfuscation_map

def validate_scanned_pattern(scanned: str, stored_code: str, obfuscation_map: Dict) -> bool:
    """Validate scanned pattern against stored code."""
    hidden = set(obfuscation_map.get("hidden_positions", []))
    mask = obfuscation_map.get("mask_char", "X")
    
    if len(scanned) != len(stored_code):
        return False
    
    for i, (scan_char, orig_char) in enumerate(zip(scanned, stored_code)):
        if i in hidden:
            if scan_char != mask:
                return False
        else:
            if scan_char != orig_char:
                return False
    return True
```

### Update QR Generator

```python
# app/utils/qr_generator.py
import json

def create_obfuscated_qr_image(qr_pattern: str, service_id: str, timestamp: int) -> str:
    qr_data = json.dumps({"qr": qr_pattern, "sid": service_id, "t": timestamp})
    return create_qr_image(qr_data)
```

### Update QR Service

```python
# In qr_service.py generate_qr_session()
from app.utils.session_code import generate_session_with_obfuscation

session_code, qr_pattern, obfuscation_map = generate_session_with_obfuscation()

qr_session = QRSession(
    token=token,
    session_code=session_code,
    qr_code_pattern=qr_pattern,
    obfuscation_map=obfuscation_map,
    # ... other fields
)
```

---

## 🧪 Testing

```python
def test_obfuscation():
    code, pattern, map_data = generate_session_with_obfuscation()
    assert len(code) == 20
    assert pattern.count('X') == 10
    assert validate_scanned_pattern(pattern, code, map_data)
```

---

## 🔗 Related Documents

- [00_MASTER_IMPLEMENTATION_PLAN.md](./00_MASTER_IMPLEMENTATION_PLAN.md)
- [03_DATABASE_SCHEMA_ALIGNMENT.md](./03_DATABASE_SCHEMA_ALIGNMENT.md)

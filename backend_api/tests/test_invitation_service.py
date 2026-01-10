import pytest
from app.services.invitation_service import (
    generate_invitation_code,
    generate_pin,
    generate_url_token
)


class TestCodeGeneration:
    """Test invitation code generation"""
    
    def test_code_length(self):
        """Code should be exactly 15 characters"""
        code = generate_invitation_code()
        assert len(code) == 15
    
    def test_code_alphanumeric(self):
        """Code should be lowercase alphanumeric only"""
        code = generate_invitation_code()
        assert code.isalnum()
        assert code == code.lower()
    
    def test_code_uniqueness(self):
        """Generated codes should be unique"""
        codes = [generate_invitation_code() for _ in range(100)]
        assert len(codes) == len(set(codes))


class TestPinGeneration:
    """Test PIN generation"""
    
    def test_pin_length(self):
        """PIN should be exactly 6 digits"""
        pin = generate_pin()
        assert len(pin) == 6
    
    def test_pin_numeric(self):
        """PIN should be numeric only"""
        pin = generate_pin()
        assert pin.isdigit()


class TestUrlToken:
    """Test URL token generation"""
    
    def test_token_length(self):
        """Token should be at least 32 characters"""
        token = generate_url_token()
        assert len(token) >= 32
    
    def test_token_url_safe(self):
        """Token should be URL-safe"""
        import re
        token = generate_url_token()
        assert re.match(r'^[A-Za-z0-9_-]+$', token)

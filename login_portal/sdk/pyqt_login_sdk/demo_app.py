import sys
from PyQt6.QtWidgets import QApplication, QMainWindow, QLabel, QVBoxLayout, QWidget
from PyQt6.QtCore import Qt

# Import our new "SDK"
from simple_auth_sdk import LoginWindow

# 1. This is YOUR main application window
#    (The app you want to protect)
class MyCoolApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My Secrete App System")
        self.resize(800, 600)
        
        # Simple content for the main app
        label = QLabel("🎉 SECRET UNLOCKED! 🎉")
        label.setStyleSheet("font-size: 30px; font-weight: bold; color: #2ecc71;")
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.setCentralWidget(label)

# 2. This is how you implement your custom login check
#    You connect this to your database or API in a real app.
def check_credentials(username, password):
    # For this demo:
    # Login is successful if username is "user" and password is "123"
    print(f"Checking login for: {username}") # for debugging
    if username == "user" and password == "123":
        return True
    return False

# 3. The Main Entry Point
if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    # --- Integration Step ---
    
    # Create the Login Window
    # Pass your custom check function
    login = LoginWindow(auth_function=check_credentials, title="My App Login")
    
    # Show the login window. 
    # 'exec()' blocks the code here until the user logs in or cancels.
    # It returns QDialog.Accepted (1) if they logged in successfully.
    if login.exec() == 1:
        # If login succeeded, show the main app
        window = MyCoolApp()
        window.show()
        sys.exit(app.exec())
    else:
        # If they cancelled or closed the window
        print("Login cancelled. Exiting.")
        sys.exit(0)

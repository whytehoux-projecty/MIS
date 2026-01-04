import sys
import demo_app

# This file just runs the demo_app.
# See demo_app.py for the source code and explanation!

if __name__ == "__main__":
    # We re-use the code block from demo_app
    from PyQt6.QtWidgets import QApplication
    from simple_auth_sdk import LoginWindow
    
    app = QApplication(sys.argv)
    
    # Use the logic from demo_app
    login = LoginWindow(auth_function=demo_app.check_credentials)
    
    if login.exec() == 1:
        window = demo_app.MyCoolApp()
        window.show()
        sys.exit(app.exec())

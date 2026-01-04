from PyQt6.QtWidgets import (
    QDialog, QVBoxLayout, QLabel, QLineEdit, QPushButton, 
    QFrame, QGraphicsDropShadowEffect, QHBoxLayout, QWidget
)
from PyQt6.QtCore import Qt, QPropertyAnimation, QEasingCurve, QPoint
from PyQt6.QtGui import QColor, QIcon
from .style import STYLESHEET

class LoginWindow(QDialog):
    def __init__(self, auth_function=None, title="Welcome Back"):
        """
        :param auth_function: A function that takes (username, password) and returns True/False.
                              If None, a default check (admin/admin) is used.
        :param title: The title to display on the login screen.
        """
        super().__init__()
        self.auth_function = auth_function or self.default_auth
        self.setWindowTitle("Login Required")
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint) # Modern frameless look
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground) # For rounded corners
        
        # Setup UI
        self.init_ui(title)
        
        # Apply Styles
        self.setStyleSheet(STYLESHEET)
        
        # Dragging logic variables
        self.old_pos = None

    def default_auth(self, username, password):
        # Default simple check for demonstration
        return username == "admin" and password == "password"

    def init_ui(self, title):
        # Main Layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)

        # Container Frame (for the visible window)
        self.container = QFrame()
        self.container.setObjectName("LoginFrame")
        layout.addWidget(self.container)
        
        # Elements inside the container
        form_layout = QVBoxLayout(self.container)
        form_layout.setSpacing(15)
        form_layout.setContentsMargins(40, 40, 40, 40)

        # Title
        title_label = QLabel(title)
        title_label.setObjectName("TitleLabel")
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        form_layout.addWidget(title_label)

        # Subtitle
        sub_label = QLabel("Please sign in to continue")
        sub_label.setObjectName("SubtitleLabel")
        sub_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        form_layout.addWidget(sub_label)

        # Inputs
        self.user_input = QLineEdit()
        self.user_input.setPlaceholderText("Username")
        form_layout.addWidget(self.user_input)

        self.pass_input = QLineEdit()
        self.pass_input.setPlaceholderText("Password")
        self.pass_input.setEchoMode(QLineEdit.EchoMode.Password)
        form_layout.addWidget(self.pass_input)

        # Error Label (Hidden by default)
        self.error_label = QLabel("")
        self.error_label.setObjectName("ErrorLabel")
        self.error_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.error_label.setVisible(False)
        form_layout.addWidget(self.error_label)

        # Buttons Layout
        btn_layout = QHBoxLayout()
        
        # Close Button (since we are frameless)
        close_btn = QPushButton("Cancel")
        close_btn.clicked.connect(self.reject)
        close_btn.setStyleSheet("background-color: #f7768e; color: white;")
        btn_layout.addWidget(close_btn)

        # Login Button
        login_btn = QPushButton("Login")
        login_btn.clicked.connect(self.handle_login)
        login_btn.setDefault(True) # Pressing Enter triggers this
        btn_layout.addWidget(login_btn)

        form_layout.addLayout(btn_layout)

        # Drop Shadow for depth
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(20)
        shadow.setXOffset(0)
        shadow.setYOffset(0)
        shadow.setColor(QColor(0, 0, 0, 100))
        self.container.setGraphicsEffect(shadow)
        
        # Set fixed size for the dialog
        self.setFixedSize(400, 450)

    def handle_login(self):
        username = self.user_input.text()
        password = self.pass_input.text()

        # Simple validation
        if not username or not password:
            self.show_error("Please fill in all fields.")
            self.shake_window()
            return

        # Check authentication using the provided function
        if self.auth_function(username, password):
            self.accept() # Closes the dialog with 'Accepted' result
        else:
            self.show_error("Invalid username or password.")
            self.shake_window()

    def show_error(self, message):
        self.error_label.setText(message)
        self.error_label.setVisible(True)

    def shake_window(self):
        # A simple animation to shake the input on error
        self.animation = QPropertyAnimation(self, b"pos")
        self.animation.setDuration(300)
        self.animation.setLoopCount(2)
        self.animation.setEasingCurve(QEasingCurve.Type.InOutBounce)
        
        start_pos = self.pos()
        self.animation.setKeyValueAt(0, start_pos)
        self.animation.setKeyValueAt(0.2, start_pos + QPoint(10, 0))
        self.animation.setKeyValueAt(0.4, start_pos - QPoint(10, 0))
        self.animation.setKeyValueAt(0.6, start_pos + QPoint(10, 0))
        self.animation.setKeyValueAt(0.8, start_pos - QPoint(10, 0))
        self.animation.setKeyValueAt(1, start_pos)
        self.animation.start()

    # --- Mouse Events for Dragging the Frameless Window ---
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.old_pos = event.globalPosition().toPoint()

    def mouseMoveEvent(self, event):
        if self.old_pos:
            delta = event.globalPosition().toPoint() - self.old_pos
            self.move(self.pos() + delta)
            self.old_pos = event.globalPosition().toPoint()

    def mouseReleaseEvent(self, event):
        self.old_pos = None

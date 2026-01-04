# simple_auth_sdk/style.py

# A modern, premium dark theme
STYLESHEET = """
QWidget {
    background-color: #1a1b26;
    color: #a9b1d6;
    font-family: 'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif;
    font-size: 14px;
}

/* The main container for the login form */
#LoginFrame {
    background-color: #24283b;
    border-radius: 20px;
    border: 1px solid #414868;
}

/* Headings */
QLabel#TitleLabel {
    color: #ffffff;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
}

QLabel#SubtitleLabel {
    color: #7aa2f7;
    font-size: 14px;
    margin-bottom: 20px;
}

/* Input Fields */
QLineEdit {
    background-color: #1a1b26;
    border: 2px solid #414868;
    border-radius: 10px;
    padding: 12px;
    color: #ffffff;
    selection-background-color: #7aa2f7;
}

QLineEdit:focus {
    border: 2px solid #7aa2f7;
    background-color: #1f2335;
}

/* Buttons */
QPushButton {
    background-color: #7aa2f7;
    color: #1a1b26;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-weight: bold;
    font-size: 15px;
}

QPushButton:hover {
    background-color: #89b4fa;
}

QPushButton:pressed {
    background-color: #5d8bd1;
}

/* Error Message */
QLabel#ErrorLabel {
    color: #f7768e;
    font-size: 12px;
    margin-top: 5px;
}
"""

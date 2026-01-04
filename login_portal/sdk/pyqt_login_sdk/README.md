# Simple Auth SDK for PyQt

Welcome! This is a plug-and-play **Login SDK** designed to make it incredibly easy to add a modern login screen to your Python desktop applications.

## 📂 Project Structure

- **`simple_auth_sdk/`**  
  This is the "SDK" folder. You can copy this entire folder into any of your future projects.
  - `login_window.py`: Contains the logic for the login window.
  - `style.py`: Contains the CSS styling (colors, fonts, shapes).

- **`demo_app.py`**  
  An example application showing how to use the SDK.

## 🚀 How to Run the Demo

1. **Install Dependencies**
   Open your terminal/command prompt in this folder and run:

   ```bash
   pip install PyQt6
   ```

2. **Run the App**

   ```bash
   python demo_app.py
   ```

   *Default Credentials:*
   - Username: `user`
   - Password: `123`

## 🛠 How to Use in Your Own App

There are just **3 Steps** to add this to your app.

### Step 1: Import the LoginWindow

Place the `simple_auth_sdk` folder in your project directory. Then, in your code:

```python
from simple_auth_sdk import LoginWindow
```

### Step 2: Define Your "Check" Logic

You need a function that tells the login window if the password is correct.

```python
def my_login_check(username, password):
    # Here you would check your database
    if username == "admin" and password == "secret":
        return True # Login Success!
    return False # Login Failed
```

### Step 3: Show the Login Window *First*

In your main execution block, show the login window. If it returns success (`1`), then show your main app.

```python
if __name__ == "__main__":
    app = QApplication([])

    # Create the login window with your check function
    login = LoginWindow(auth_function=my_login_check)

    if login.exec() == 1:
        # Login was successful!
        # Now launch your main application window
        main_window = MyMainApp()
        main_window.show()
        
        app.exec() # Start the app loop
```

## 🎨 Customizing the Look

To change colors, fonts, or shapes, simply open `simple_auth_sdk/style.py`.
It uses standard CSS-like syntax clearly labeled for "Buttons", "Inputs", etc.

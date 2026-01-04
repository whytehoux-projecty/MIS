#!/bin/bash
# Get the directory where PyQt6 is installed
PYQT_PATH=$(python3 -c "import os, PyQt6; print(os.path.dirname(PyQt6.__file__))")
PLUGIN_PATH="$PYQT_PATH/Qt6/plugins"

echo "Detected PyQt6 at: $PYQT_PATH"
echo "Setting Qt Plugin Path to: $PLUGIN_PATH"

export QT_QPA_PLATFORM_PLUGIN_PATH=$PLUGIN_PATH

echo "Starting the Login SDK Demo..."
python3 demo_app.py

import uvicorn
import sys
sys.path.append('.')

def run_server():
    """Run the FastAPI server with optimal settings"""
    print("🚀 Starting Central Auth API...")
    print("📝 Logs will appear below")
    print("🌐 API will be available at: http://localhost:8000")
    print("📚 Documentation at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info",
        access_log=True
    )

if __name__ == "__main__":
    run_server()
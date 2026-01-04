from fastapi import APIRouter, UploadFile, File, HTTPException, status
import shutil
import os
import uuid

router = APIRouter()

# Define upload paths relative to the project root
# Using strict configuration for upload directory
UPLOAD_DIR = "uploads"
PHOTO_DIR = os.path.join(UPLOAD_DIR, "photos")
AUDIO_DIR = os.path.join(UPLOAD_DIR, "audio")

# Ensure directories exist
os.makedirs(PHOTO_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

@router.post("/photo", status_code=status.HTTP_201_CREATED)
async def upload_photo(file: UploadFile = File(...)):
    """
    Upload a photo for registration.
    Returns the file ID and URL for access through the static mount.
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )

        # Generate unique filename
        # Use .jpg as default if extension missing, otherwise preserve orig extension
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        if not file_extension:
             file_extension = ".jpg"

        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(PHOTO_DIR, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return file info
        return {
            "success": True,
            "file_id": unique_filename,
            "url": f"/uploads/photos/{unique_filename}",
            "message": "Photo uploaded successfully"
        }

    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload photo: {str(e)}"
        )

@router.post("/audio", status_code=status.HTTP_201_CREATED)
async def upload_audio(file: UploadFile = File(...)):
    """
    Upload an audio recording (Oath).
    Returns file ID and URL.
    """
    try:
        # Basic validation
        if not file.content_type.startswith("audio/") and not file.content_type.startswith("video/webm"): 
             # Chrome MediaRecorder often sends audio/webm as video/webm or just video/webm container
            pass 

        # Generate unique filename
        file_extension = ".webm" # Default for browser MediaRecorder
        if file.filename:
             ext = os.path.splitext(file.filename)[1]
             if ext:
                 file_extension = ext
        
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(AUDIO_DIR, unique_filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return {
            "success": True,
            "file_id": unique_filename,
            "url": f"/uploads/audio/{unique_filename}",
            "message": "Audio uploaded successfully"
        }

    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload audio: {str(e)}"
        )


@router.get("/list")
async def list_uploads(media_type: str = "all"):
    """
    List all uploaded files (Admin only).
    media_type can be 'photos', 'audio', or 'all'
    """
    try:
        files = []
        
        if media_type in ["photos", "all"]:
            if os.path.exists(PHOTO_DIR):
                for filename in os.listdir(PHOTO_DIR):
                    filepath = os.path.join(PHOTO_DIR, filename)
                    if os.path.isfile(filepath):
                        stat = os.stat(filepath)
                        files.append({
                            "id": filename,
                            "type": "photo",
                            "filename": filename,
                            "url": f"/uploads/photos/{filename}",
                            "size_bytes": stat.st_size,
                            "created_at": stat.st_mtime
                        })
        
        if media_type in ["audio", "all"]:
            if os.path.exists(AUDIO_DIR):
                for filename in os.listdir(AUDIO_DIR):
                    filepath = os.path.join(AUDIO_DIR, filename)
                    if os.path.isfile(filepath):
                        stat = os.stat(filepath)
                        files.append({
                            "id": filename,
                            "type": "audio",
                            "filename": filename,
                            "url": f"/uploads/audio/{filename}",
                            "size_bytes": stat.st_size,
                            "created_at": stat.st_mtime
                        })
        
        # Sort by created time, newest first
        files.sort(key=lambda x: x["created_at"], reverse=True)
        
        return {
            "success": True,
            "count": len(files),
            "files": files
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list uploads: {str(e)}"
        )


@router.delete("/{media_type}/{file_id}")
async def delete_upload(media_type: str, file_id: str):
    """
    Delete an uploaded file (Admin only).
    """
    try:
        if media_type == "photos":
            file_path = os.path.join(PHOTO_DIR, file_id)
        elif media_type == "audio":
            file_path = os.path.join(AUDIO_DIR, file_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid media type. Use 'photos' or 'audio'"
            )
        
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        os.remove(file_path)
        
        return {
            "success": True,
            "message": f"File {file_id} deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )

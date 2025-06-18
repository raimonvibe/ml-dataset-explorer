from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
import base64

router = APIRouter()

def generate_placeholder_image(width: int = 400, height: int = 300, text: str = "Sample Image"):
    svg_content = f'''<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666" text-anchor="middle" dy=".3em">{text}</text>
    </svg>'''
    return svg_content.encode('utf-8')

@router.get("/chest-xray/{image_id}")
async def get_chest_xray_image(image_id: str):
    svg_content = generate_placeholder_image(512, 512, f"Chest X-ray\n{image_id}")
    return Response(content=svg_content, media_type="image/svg+xml")

@router.get("/tiny-imagenet/{class_id}/{image_id}")
async def get_tiny_imagenet_image(class_id: str, image_id: str):
    svg_content = generate_placeholder_image(64, 64, f"TinyImageNet\n{class_id}")
    return Response(content=svg_content, media_type="image/svg+xml")

@router.get("/kitti/{sequence_id}/{frame_id}")
async def get_kitti_image(sequence_id: str, frame_id: str):
    if "camera" in frame_id:
        svg_content = generate_placeholder_image(1242, 375, f"KITTI Camera\n{sequence_id}\n{frame_id}")
    elif "lidar" in frame_id:
        svg_content = generate_placeholder_image(600, 400, f"KITTI LIDAR\n{sequence_id}\n{frame_id}")
    else:
        svg_content = generate_placeholder_image(600, 400, f"KITTI Data\n{sequence_id}\n{frame_id}")
    
    return Response(content=svg_content, media_type="image/svg+xml")

@router.get("/upload/{category}/{upload_id}")
async def get_uploaded_image(category: str, upload_id: str):
    svg_content = generate_placeholder_image(400, 400, f"Uploaded {category.title()}\n{upload_id}")
    return Response(content=svg_content, media_type="image/svg+xml")

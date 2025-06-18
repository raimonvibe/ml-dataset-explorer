from typing import List, Dict, Any

class KittiService:
    def __init__(self):
        self.base_url = "http://www.cvlibs.net/datasets/kitti"
    
    async def get_sequences(self) -> List[Dict[str, Any]]:
        sequences = []
        for i in range(21):
            sequences.append({
                "id": f"sequence_{i:02d}",
                "name": f"Drive Sequence {i:02d}",
                "location": "Karlsruhe, Germany",
                "scenario": "Urban" if i % 2 == 0 else "Highway",
                "frame_count": 400 + (i * 50),
                "duration_seconds": 40 + (i * 5)
            })
        return sequences
    
    async def get_sequence_info(self, sequence_id: str) -> Dict[str, Any]:
        return {
            "id": sequence_id,
            "name": f"Drive {sequence_id}",
            "location": "Karlsruhe, Germany",
            "scenario": "Urban",
            "frame_count": 465,
            "duration_seconds": 46.5,
            "sensors": ["Camera", "LIDAR", "GPS", "IMU"]
        }
    
    async def get_sequence_frames(self, sequence_id: str, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        frames = []
        for i in range(limit):
            frame_id = offset + i
            frames.append({
                "id": f"{sequence_id}_frame_{frame_id:06d}",
                "sequence_id": sequence_id,
                "frame_number": frame_id,
                "timestamp": frame_id * 0.1,
                "camera_url": f"/api/v1/images/kitti/{sequence_id}/camera_{frame_id:06d}",
                "lidar_url": f"/api/v1/images/kitti/{sequence_id}/lidar_{frame_id:06d}"
            })
        return frames

import requests
import zipfile
import io
from typing import List, Dict, Any

class StanfordService:
    def __init__(self):
        self.base_url = "http://cs231n.stanford.edu"
        self.dataset_url = f"{self.base_url}/tiny-imagenet-200.zip"
    
    async def get_class_list(self) -> List[Dict[str, Any]]:
        classes = []
        class_names = [
            "Egyptian cat", "Persian cat", "tabby cat", "tiger cat", "Siamese cat",
            "golden retriever", "Labrador retriever", "beagle", "basset hound", "bloodhound",
            "sports car", "convertible", "limousine", "pickup truck", "fire engine",
            "airliner", "warplane", "space shuttle", "hot air balloon", "airship",
            "acoustic guitar", "electric guitar", "banjo", "cello", "violin"
        ]
        
        for i, name in enumerate(class_names):
            classes.append({
                "id": f"n{i:08d}",
                "name": name,
                "wordnet_id": f"n{i:08d}",
                "sample_count": 500
            })
        
        return classes
    
    async def get_class_samples(self, class_id: str, count: int = 20) -> List[Dict[str, Any]]:
        samples = []
        for i in range(count):
            samples.append({
                "id": f"{class_id}_{i+1}",
                "filename": f"{class_id}_{i+1}.JPEG",
                "class_id": class_id,
                "width": 64,
                "height": 64,
                "url": f"/api/v1/images/tiny-imagenet/{class_id}/{class_id}_{i+1}"
            })
        return samples
    
    async def get_dataset_statistics(self) -> Dict[str, Any]:
        return {
            "total_images": 120000,
            "total_classes": 200,
            "image_size": "64x64",
            "training_images": 100000,
            "validation_images": 10000,
            "test_images": 10000
        }

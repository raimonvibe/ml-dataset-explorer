const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface Dataset {
  id: string;
  name: string;
  source_type: string;
  description: string;
  total_images?: number;
  categories?: string[] | number;
}

export interface DatasetSample {
  id: string;
  filename: string;
  category?: string;
  file_size: number;
  width: number;
  height: number;
  url: string;
}

export interface ChestXrayStats {
  total_images: number;
  normal_cases: number;
  pneumonia_cases: number;
  distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export interface TinyImageNetStats {
  total_images: number;
  total_classes: number;
  training_images: number;
  validation_images: number;
  test_images: number;
  distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export interface UploadResponse {
  message: string;
  uploads: Array<{
    upload_id: string;
    original_filename: string;
    stored_filename: string;
    category: string;
    file_size: number;
    processing_status: string;
    analysis_results: any;
  }>;
}

class ApiService {
  private async fetchApi(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getDatasets(): Promise<{ datasets: Dataset[] }> {
    return this.fetchApi('/datasets');
  }

  async getChestXraySamples(limit = 20, offset = 0): Promise<{ samples: DatasetSample[] }> {
    return this.fetchApi(`/datasets/chest-xray/samples?limit=${limit}&offset=${offset}`);
  }

  async getChestXrayStatistics(): Promise<ChestXrayStats> {
    return this.fetchApi('/datasets/chest-xray/statistics');
  }

  async getTinyImageNetClasses(limit = 50, offset = 0) {
    return this.fetchApi(`/datasets/tiny-imagenet/classes?limit=${limit}&offset=${offset}`);
  }

  async getTinyImageNetSamples(classId: string, limit = 20) {
    return this.fetchApi(`/datasets/tiny-imagenet/samples/${classId}?limit=${limit}`);
  }

  async getTinyImageNetStatistics(): Promise<TinyImageNetStats> {
    return this.fetchApi('/datasets/tiny-imagenet/statistics');
  }

  async getKittiSequences() {
    return this.fetchApi('/datasets/kitti/sequences');
  }

  async getKittiSequence(sequenceId: string) {
    return this.fetchApi(`/datasets/kitti/sequence/${sequenceId}`);
  }

  async getKittiFrames(sequenceId: string, limit = 20, offset = 0) {
    return this.fetchApi(`/datasets/kitti/frames/${sequenceId}?limit=${limit}&offset=${offset}`);
  }

  async uploadFiles(category: string, files: FileList): Promise<UploadResponse> {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${API_BASE_URL}/upload/${category}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();

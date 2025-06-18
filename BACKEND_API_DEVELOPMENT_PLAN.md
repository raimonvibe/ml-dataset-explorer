# ML Dataset Explorer - Backend API Development Plan

## Project Overview
This document outlines the comprehensive plan for developing a backend API that connects the ML Dataset Explorer frontend to original dataset sources and adds image upload functionality for medical images, X-rays, and traffic images.

**Current Frontend**: https://dataset-downloader-app-9ctg3b53.devinapps.com
**Repository**: https://github.com/raimonvibe/ml-dataset-explorer

## 1. Architecture Overview

### 1.1 Technology Stack
- **Backend Framework**: FastAPI (Python) or Express.js (Node.js)
- **Database**: PostgreSQL for metadata, Redis for caching
- **File Storage**: AWS S3 or Google Cloud Storage for uploaded images
- **Authentication**: JWT tokens with OAuth2 integration
- **API Documentation**: OpenAPI/Swagger auto-generated docs
- **Deployment**: Docker containers on cloud platforms

### 1.2 System Architecture
```
Frontend (React) → API Gateway → Backend Services → External APIs
                                      ↓
                              File Storage (S3/GCS)
                                      ↓
                              Database (PostgreSQL)
```

## 2. Dataset Source Integration

### 2.1 Chest X-ray Dataset - Kaggle API Integration

**Original Source**: https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia

**Implementation Steps**:
1. **Kaggle API Setup**
   - Install kaggle-api package
   - Configure API credentials (kaggle.json)
   - Set up authentication middleware

2. **API Endpoints**:
   ```
   GET /api/datasets/chest-xray/samples
   GET /api/datasets/chest-xray/categories
   GET /api/datasets/chest-xray/statistics
   GET /api/images/chest-xray/{image_id}
   ```

3. **Data Processing**:
   - Cache popular samples in Redis
   - Implement image resizing and optimization
   - Add metadata extraction (DICOM tags if available)

### 2.2 Tiny-ImageNet-200 - Stanford Direct Integration

**Original Source**: http://cs231n.stanford.edu/tiny-imagenet-200.zip

**Implementation Steps**:
1. **Direct HTTP Integration**
   - Stream data directly from Stanford servers
   - Implement ZIP file processing for on-demand extraction
   - Cache class definitions and sample images

2. **API Endpoints**:
   ```
   GET /api/datasets/tiny-imagenet/classes
   GET /api/datasets/tiny-imagenet/samples/{class_id}
   GET /api/datasets/tiny-imagenet/statistics
   GET /api/images/tiny-imagenet/{class_id}/{image_id}
   ```

3. **Class Management**:
   - Parse WordNet IDs (wnids.txt)
   - Map class names to human-readable labels
   - Implement class hierarchy navigation

### 2.3 KITTI Dataset - Official Integration

**Original Source**: http://www.cvlibs.net/datasets/kitti/

**Implementation Steps**:
1. **KITTI API Integration**
   - Connect to official KITTI dataset URLs
   - Handle multiple drive sequences
   - Process both camera and LIDAR data

2. **API Endpoints**:
   ```
   GET /api/datasets/kitti/sequences
   GET /api/datasets/kitti/sequence/{sequence_id}
   GET /api/datasets/kitti/frames/{sequence_id}
   GET /api/images/kitti/{sequence_id}/{frame_id}
   ```

3. **Data Types**:
   - Camera images (stereo pairs)
   - LIDAR point clouds
   - GPS/IMU data
   - Calibration parameters

## 3. Image Upload Functionality

### 3.1 Medical Images Upload

**Supported Formats**: DICOM, JPEG, PNG, TIFF
**Max File Size**: 50MB per image
**Batch Upload**: Up to 100 images per request

**API Endpoints**:
```
POST /api/upload/medical
POST /api/upload/medical/batch
GET /api/uploads/medical/{upload_id}
DELETE /api/uploads/medical/{upload_id}
```

**Features**:
- DICOM metadata extraction
- Medical image validation
- Automatic anonymization options
- Integration with medical imaging standards

### 3.2 X-ray Images Upload

**Specialized Processing**:
- Chest X-ray specific validation
- Automatic orientation correction
- Pneumonia detection preprocessing
- Integration with existing chest X-ray dataset

**API Endpoints**:
```
POST /api/upload/xray
POST /api/upload/xray/analyze
GET /api/uploads/xray/{upload_id}/analysis
```

**AI Integration**:
- Pre-trained model inference
- Confidence scoring
- Comparison with dataset samples

### 3.3 Traffic Images Upload

**Supported Scenarios**:
- Street scenes
- Autonomous driving footage
- Traffic sign recognition
- Vehicle detection datasets

**API Endpoints**:
```
POST /api/upload/traffic
POST /api/upload/traffic/sequence
GET /api/uploads/traffic/{upload_id}/analysis
```

**Processing Features**:
- GPS coordinate extraction
- Vehicle/pedestrian detection
- Traffic sign recognition
- Integration with KITTI format

## 4. Database Schema

### 4.1 Core Tables

```sql
-- Datasets metadata
CREATE TABLE datasets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'kaggle', 'stanford', 'kitti'
    source_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Images metadata
CREATE TABLE images (
    id UUID PRIMARY KEY,
    dataset_id UUID REFERENCES datasets(id),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User uploads
CREATE TABLE uploads (
    id UUID PRIMARY KEY,
    user_id UUID,
    category VARCHAR(50) NOT NULL, -- 'medical', 'xray', 'traffic'
    original_filename VARCHAR(255),
    stored_filename VARCHAR(255),
    file_path TEXT,
    file_size BIGINT,
    processing_status VARCHAR(50) DEFAULT 'pending',
    analysis_results JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
    id UUID PRIMARY KEY,
    endpoint VARCHAR(255),
    user_id UUID,
    request_count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 5. Authentication & Security

### 5.1 Authentication System
- JWT token-based authentication
- OAuth2 integration (Google, GitHub)
- API key management for external services
- Rate limiting per user/IP

### 5.2 Security Measures
- Input validation and sanitization
- File type verification
- Virus scanning for uploads
- CORS configuration
- HTTPS enforcement
- Data encryption at rest

### 5.3 Privacy Compliance
- GDPR compliance for EU users
- HIPAA considerations for medical data
- Data retention policies
- User consent management

## 6. API Endpoints Specification

### 6.1 Dataset Endpoints

```yaml
/api/datasets:
  get:
    summary: List all available datasets
    responses:
      200:
        description: List of datasets with metadata

/api/datasets/{dataset_id}/samples:
  get:
    summary: Get sample images from dataset
    parameters:
      - name: limit
        type: integer
        default: 20
      - name: offset
        type: integer
        default: 0
    responses:
      200:
        description: Array of sample images

/api/datasets/{dataset_id}/statistics:
  get:
    summary: Get dataset statistics
    responses:
      200:
        description: Dataset statistics and metadata
```

### 6.2 Upload Endpoints

```yaml
/api/upload/{category}:
  post:
    summary: Upload images to specific category
    requestBody:
      content:
        multipart/form-data:
          schema:
            type: object
            properties:
              files:
                type: array
                items:
                  type: string
                  format: binary
    responses:
      201:
        description: Upload successful
      400:
        description: Invalid file format
      413:
        description: File too large
```

### 6.3 Analysis Endpoints

```yaml
/api/analyze/{category}/{upload_id}:
  get:
    summary: Get analysis results for uploaded image
    responses:
      200:
        description: Analysis results
      202:
        description: Analysis in progress
      404:
        description: Upload not found
```

## 7. Frontend Integration

### 7.1 API Client Setup
- Create API client service in React
- Implement authentication handling
- Add error handling and retry logic
- Configure base URLs for different environments

### 7.2 Component Updates

**Current Components to Update**:
1. **Overview Tab**: Connect to real dataset statistics
2. **Chest X-ray Tab**: Add upload functionality and real image gallery
3. **Tiny-ImageNet Tab**: Connect to Stanford API and add class browser
4. **KITTI Tab**: Connect to official KITTI data and add sequence viewer

**New Components to Add**:
1. **ImageUploader**: Drag-and-drop upload interface
2. **AnalysisViewer**: Display AI analysis results
3. **DatasetBrowser**: Navigate through real dataset samples
4. **UserDashboard**: Manage uploads and view history

### 7.3 State Management
- Implement Redux or Zustand for global state
- Add loading states for API calls
- Implement caching for frequently accessed data
- Add offline support with service workers

## 8. Performance Optimization

### 8.1 Caching Strategy
- Redis for frequently accessed images
- CDN for static assets
- Browser caching headers
- API response caching

### 8.2 Image Optimization
- Automatic image resizing
- WebP format conversion
- Lazy loading implementation
- Progressive image loading

### 8.3 Database Optimization
- Proper indexing strategy
- Query optimization
- Connection pooling
- Read replicas for scaling

## 9. Deployment Strategy

### 9.1 Development Environment
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 9.2 Production Deployment
- **Container Orchestration**: Kubernetes or Docker Swarm
- **Load Balancing**: NGINX or cloud load balancer
- **Database**: Managed PostgreSQL service
- **File Storage**: AWS S3 or Google Cloud Storage
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK stack or cloud logging

### 9.3 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Backend API
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: pytest
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          docker build -t ml-dataset-api .
          docker push $REGISTRY/ml-dataset-api
```

## 10. Testing Strategy

### 10.1 Unit Tests
- API endpoint testing
- Database model testing
- Image processing function testing
- Authentication middleware testing

### 10.2 Integration Tests
- External API integration testing
- File upload/download testing
- Database integration testing
- End-to-end workflow testing

### 10.3 Performance Tests
- Load testing with multiple concurrent users
- Image processing performance testing
- Database query performance testing
- API response time testing

## 11. Monitoring & Analytics

### 11.1 Application Monitoring
- API response times
- Error rates and types
- Database performance metrics
- File storage usage

### 11.2 Business Analytics
- Dataset usage statistics
- Popular image categories
- User engagement metrics
- Upload success rates

### 11.3 Alerting
- High error rates
- Database connection issues
- Storage quota warnings
- Security breach attempts

## 12. Implementation Timeline

### Phase 1 (Weeks 1-2): Foundation
- Set up development environment
- Implement basic API structure
- Set up database and authentication
- Create core dataset endpoints

### Phase 2 (Weeks 3-4): Dataset Integration
- Implement Kaggle API integration
- Add Stanford dataset connection
- Set up KITTI data access
- Create image serving endpoints

### Phase 3 (Weeks 5-6): Upload Functionality
- Implement file upload system
- Add image processing pipeline
- Create analysis endpoints
- Set up storage infrastructure

### Phase 4 (Weeks 7-8): Frontend Integration
- Update React components
- Implement API client
- Add upload interfaces
- Connect real data to existing UI

### Phase 5 (Weeks 9-10): Testing & Deployment
- Comprehensive testing
- Performance optimization
- Production deployment
- Monitoring setup

## 13. Cost Estimation

### 13.1 Development Costs
- Backend development: 8-10 weeks
- Frontend integration: 2-3 weeks
- Testing and deployment: 2 weeks
- Total development time: 12-15 weeks

### 13.2 Infrastructure Costs (Monthly)
- Cloud hosting: $200-500
- Database: $100-300
- File storage: $50-200
- CDN: $50-100
- Monitoring: $50-100
- Total monthly: $450-1200

### 13.3 External API Costs
- Kaggle API: Free tier available
- Stanford dataset: Free
- KITTI dataset: Free
- Cloud services: Pay-per-use

## 14. Risk Assessment

### 14.1 Technical Risks
- External API rate limits
- Large file processing challenges
- Database performance at scale
- Security vulnerabilities

### 14.2 Mitigation Strategies
- Implement robust caching
- Use background job processing
- Regular security audits
- Comprehensive monitoring

## 15. Future Enhancements

### 15.1 AI/ML Features
- Automated image classification
- Anomaly detection in medical images
- Real-time object detection in traffic images
- Custom model training interface

### 15.2 Collaboration Features
- Multi-user dataset sharing
- Annotation tools
- Version control for datasets
- Research collaboration platform

### 15.3 Advanced Analytics
- Dataset comparison tools
- Statistical analysis dashboard
- Export capabilities
- API for researchers

## Conclusion

This comprehensive plan provides a roadmap for transforming the ML Dataset Explorer from a demo application into a fully functional platform that connects to original dataset sources and provides powerful image upload and analysis capabilities. The phased approach ensures manageable development while delivering value at each stage.

The architecture is designed to be scalable, secure, and maintainable, with proper consideration for performance, cost, and user experience. Implementation of this plan will create a valuable tool for researchers, students, and professionals working with machine learning datasets.

---

**Next Steps**:
1. Review and approve this development plan
2. Set up development environment
3. Begin Phase 1 implementation
4. Establish regular progress reviews

**Contact**: For questions or clarifications about this plan, please refer to the technical specifications and implementation details provided above.

# ML Dataset Explorer Backend API

FastAPI backend for the ML Dataset Explorer application providing dataset integration and image upload functionality.

## Features

- **Dataset Integration**: Connect to Kaggle, Stanford, and KITTI datasets
- **Image Upload**: Support for medical images, X-rays, and traffic images
- **RESTful API**: Comprehensive API endpoints for dataset exploration
- **Authentication**: JWT-based authentication system
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Caching**: Redis for performance optimization

## Quick Start

### Using Docker (Recommended)

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Start the services:
```bash
docker-compose up -d
```

The API will be available at `http://localhost:8000`

### Manual Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL and Redis services

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the development server:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Datasets
- `GET /api/v1/datasets` - List all datasets
- `GET /api/v1/datasets/chest-xray/samples` - Get chest X-ray samples
- `GET /api/v1/datasets/chest-xray/statistics` - Get chest X-ray statistics
- `GET /api/v1/datasets/tiny-imagenet/classes` - Get Tiny-ImageNet classes
- `GET /api/v1/datasets/tiny-imagenet/statistics` - Get Tiny-ImageNet statistics
- `GET /api/v1/datasets/kitti/sequences` - Get KITTI sequences

### Image Upload
- `POST /api/v1/upload/medical` - Upload medical images
- `POST /api/v1/upload/xray` - Upload X-ray images
- `POST /api/v1/upload/traffic` - Upload traffic images

### Images
- `GET /api/v1/images/chest-xray/{image_id}` - Get chest X-ray image
- `GET /api/v1/images/tiny-imagenet/{class_id}/{image_id}` - Get Tiny-ImageNet image
- `GET /api/v1/images/kitti/{sequence_id}/{frame_id}` - Get KITTI image

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: JWT secret key
- `KAGGLE_USERNAME`: Kaggle API username
- `KAGGLE_KEY`: Kaggle API key

## Development

The API includes comprehensive error handling, input validation, and automatic API documentation available at `/docs`.

For production deployment, ensure proper security configurations and use environment-specific settings.

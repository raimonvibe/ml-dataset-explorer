
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { CheckCircle, AlertTriangle, Car, Users, Activity } from 'lucide-react'

interface UploadResult {
  message: string
  uploads: Array<{
    upload_id: string
    original_filename: string
    category: string
    processing_status: string
    analysis_results: any
  }>
}

interface UploadResultsProps {
  results: UploadResult[]
  category: 'medical' | 'xray' | 'traffic'
}

export function UploadResults({ results, category }: UploadResultsProps) {
  if (!results || results.length === 0) {
    return null
  }

  const allUploads = results.flatMap(result => result.uploads)

  const renderAnalysisResults = (upload: any) => {
    const { analysis_results } = upload

    if (category === 'xray' && analysis_results?.pneumonia_detection) {
      const { pneumonia_detection } = analysis_results
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pneumonia Detection</span>
            <Badge variant={pneumonia_detection.prediction === 'normal' ? 'default' : 'destructive'}>
              {pneumonia_detection.prediction}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Confidence</span>
              <span>{(pneumonia_detection.confidence * 100).toFixed(1)}%</span>
            </div>
            <Progress value={pneumonia_detection.confidence * 100} className="h-2" />
          </div>
          <p className="text-xs text-gray-500">Model: {pneumonia_detection.model_version}</p>
        </div>
      )
    }

    if (category === 'traffic' && analysis_results?.detected_objects) {
      const { detected_objects } = analysis_results
      return (
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center space-x-1">
            <Car className="h-4 w-4" />
            <span>Detected Objects</span>
          </h4>
          <div className="space-y-2">
            {detected_objects.map((obj: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {obj.type === 'vehicle' && <Car className="h-4 w-4 text-blue-500" />}
                  {obj.type === 'pedestrian' && <Users className="h-4 w-4 text-green-500" />}
                  {obj.type === 'traffic_sign' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  <span className="text-sm capitalize">{obj.type.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{obj.count}</Badge>
                  <span className="text-xs text-gray-500">
                    {(obj.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (category === 'medical' && analysis_results) {
      return (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Medical Analysis</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Image Type</span>
              <Badge variant="outline">{analysis_results.image_type}</Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Format</span>
              <span className="text-gray-500">{analysis_results.format}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Anonymized</span>
              <Badge variant={analysis_results.anonymized ? 'default' : 'destructive'}>
                {analysis_results.anonymized ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="text-sm text-gray-500">
        Analysis completed successfully
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span>Upload Results</span>
        </CardTitle>
        <CardDescription>
          {allUploads.length} image{allUploads.length !== 1 ? 's' : ''} processed successfully
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allUploads.map((upload) => (
            <div key={upload.upload_id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{upload.original_filename}</h4>
                  <p className="text-xs text-gray-500">ID: {upload.upload_id}</p>
                </div>
                <Badge 
                  variant={upload.processing_status === 'completed' ? 'default' : 'secondary'}
                >
                  {upload.processing_status}
                </Badge>
              </div>
              
              {upload.analysis_results && (
                <div className="border-t pt-3">
                  {renderAnalysisResults(upload)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

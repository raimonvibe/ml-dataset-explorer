import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Upload, FileImage, X, CheckCircle, AlertCircle } from 'lucide-react'
import { apiService } from '../services/api'

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  result?: any
  error?: string
}

interface ImageUploadProps {
  category: 'medical' | 'xray' | 'traffic'
  title: string
  description: string
  acceptedTypes?: string[]
  maxFiles?: number
  onUploadComplete?: (results: any[]) => void
}

export function ImageUpload({ 
  category, 
  title, 
  description, 
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
  maxFiles = 10,
  onUploadComplete 
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        return false
      }
      if (file.size > 50 * 1024 * 1024) {
        return false
      }
      return true
    })

    if (files.length + validFiles.length > maxFiles) {
      validFiles.splice(maxFiles - files.length)
    }

    const uploadFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }))

    setFiles(prev => [...prev, ...uploadFiles])
  }, [files.length, acceptedTypes, maxFiles])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return

    setIsUploading(true)
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (const uploadFile of pendingFiles) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'uploading', progress: 50 }
            : f
        ))

        const fileList = new DataTransfer()
        fileList.items.add(uploadFile.file)
        
        const result = await apiService.uploadFiles(category, fileList.files)
        
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'completed', progress: 100, result }
            : f
        ))
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        ))
      }
    }

    setIsUploading(false)
    
    setFiles(prev => {
      const completedResults = prev
        .filter(f => f.status === 'completed' && f.result)
        .map(f => f.result)
      
      if (completedResults.length > 0 && onUploadComplete) {
        onUploadComplete(completedResults)
      }
      
      return prev
    })
  }, [files, category, onUploadComplete])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop images here or click to select
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports JPEG, PNG up to 50MB each. Max {maxFiles} files.
          </p>
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-input-${category}`}
          />
          <Button 
            variant="outline" 
            onClick={() => document.getElementById(`file-input-${category}`)?.click()}
            disabled={isUploading}
          >
            Select Files
          </Button>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Selected Files ({files.length})</h4>
              <div className="space-x-2">
                <Button 
                  onClick={uploadFiles} 
                  disabled={isUploading || files.every(f => f.status !== 'pending')}
                  size="sm"
                >
                  {isUploading ? 'Uploading...' : 'Upload All'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearAll}
                  disabled={isUploading}
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === 'pending' && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                    {uploadFile.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <Progress value={uploadFile.progress} className="w-16" />
                        <Badge variant="secondary">Uploading</Badge>
                      </div>
                    )}
                    {uploadFile.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="default">Completed</Badge>
                      </div>
                    )}
                    {uploadFile.status === 'error' && (
                      <div className="flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <Badge variant="destructive">Error</Badge>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

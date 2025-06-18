import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Brain, 
  Car, 
  BarChart3, 
  Database, 
  Image, 
  Eye,
  Activity,
  Cpu,
  Navigation,
  Download,
  Users,
  FileImage,
  Zap,
  Loader2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { apiService, type ChestXrayStats, type TinyImageNetStats } from './services/api'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [chestXrayStats, setChestXrayStats] = useState<ChestXrayStats | null>(null)
  const [tinyImageNetStats, setTinyImageNetStats] = useState<TinyImageNetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const kittiProgress = 75

  const loadData = async (isRetry = false) => {
    try {
      setLoading(true)
      if (isRetry) {
        setError(null)
      }
      const [chestXrayData, tinyImageNetData] = await Promise.all([
        apiService.getChestXrayStatistics(),
        apiService.getTinyImageNetStatistics()
      ])
      setChestXrayStats(chestXrayData)
      setTinyImageNetStats(tinyImageNetData)
      setError(null)
      setRetryCount(0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      console.error('API Error:', errorMessage)
      setChestXrayStats({
        total_images: 5856,
        normal_cases: 1583,
        pneumonia_cases: 4273,
        distribution: [
          { name: 'Normal', value: 1583, color: '#10b981' },
          { name: 'Pneumonia', value: 4273, color: '#ef4444' }
        ]
      })
      setTinyImageNetStats({
        total_images: 120000,
        total_classes: 200,
        training_images: 100000,
        validation_images: 10000,
        test_images: 10000,
        distribution: [
          { name: 'Training', value: 100000, color: '#3b82f6' },
          { name: 'Validation', value: 10000, color: '#8b5cf6' },
          { name: 'Test', value: 10000, color: '#f59e0b' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    loadData(true)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Database className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ML Dataset Explorer</h1>
                <p className="text-sm text-gray-600">Interactive Machine Learning Dataset Visualization</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Activity className="h-3 w-3 mr-1" />
                Live Data
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {retryCount > 0 && (
                      <p className="mt-1 text-xs">Retry attempt: {retryCount}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={handleRetry}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Retry'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="chest-xray" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Chest X-ray</span>
            </TabsTrigger>
            <TabsTrigger value="tiny-imagenet" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Tiny-ImageNet</span>
            </TabsTrigger>
            <TabsTrigger value="kitti" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>KITTI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Medical Imaging</CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : chestXrayStats?.total_images.toLocaleString() || '5,856'}
                  </div>
                  <p className="text-xs text-muted-foreground">Chest X-ray images</p>
                  <div className="mt-4">
                    <img 
                      src="/images/medical-stethoscope.jpg" 
                      alt="Medical stethoscope representing healthcare AI"
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x200/e2e8f0/64748b?text=Medical+Imaging'
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Computer Vision</CardTitle>
                  <Brain className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : tinyImageNetStats?.total_classes || '200'}
                  </div>
                  <p className="text-xs text-muted-foreground">Object classes</p>
                  <div className="mt-4">
                    <img 
                      src="/images/computer-vision-ai.jpg" 
                      alt="AI computer vision representation"
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/400x200/dbeafe/3b82f6?text=Computer+Vision'
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Autonomous Driving</CardTitle>
                  <Car className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kittiProgress}%</div>
                  <p className="text-xs text-muted-foreground">Download progress</p>
                  <div className="mt-4">
                    <img 
                      src="https://placehold.co/400x200/dcfce7/16a34a?text=KITTI+Street+Scenes"
                      alt="KITTI autonomous driving dataset"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileImage className="h-5 w-5" />
                    <span>Dataset Distribution</span>
                  </CardTitle>
                  <CardDescription>Overview of all three datasets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Chest X-ray</span>
                      </div>
                      <Badge variant="outline">
                        {loading ? '...' : `${(chestXrayStats?.total_images || 5856) / 1000}K images`}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Tiny-ImageNet</span>
                      </div>
                      <Badge variant="outline">
                        {loading ? '...' : `${(tinyImageNetStats?.total_images || 120000) / 1000}K images`}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-green-500" />
                        <span className="text-sm">KITTI</span>
                      </div>
                      <Badge variant="outline">~6GB data</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Quick Stats</span>
                  </CardTitle>
                  <CardDescription>Key metrics across datasets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Images</span>
                      <span className="font-semibold">
                        {loading ? '...' : `~${Math.round(((chestXrayStats?.total_images || 5856) + (tinyImageNetStats?.total_images || 120000)) / 1000)}K`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Medical Classes</span>
                      <span className="font-semibold">2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Object Classes</span>
                      <span className="font-semibold">
                        {loading ? '...' : tinyImageNetStats?.total_classes || '200'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Drive Sequences</span>
                      <span className="font-semibold">Multiple</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chest-xray" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Chest X-ray Pneumonia Detection</span>
                  </CardTitle>
                  <CardDescription>Medical imaging dataset for pneumonia classification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img 
                      src="/images/medical-stethoscope.jpg" 
                      alt="Medical stethoscope representing healthcare AI"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x300/f1f5f9/64748b?text=Medical+X-ray+Dataset'
                      }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : chestXrayStats?.normal_cases.toLocaleString() || '1,583'}
                        </div>
                        <div className="text-sm text-green-700">Normal Cases</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : chestXrayStats?.pneumonia_cases.toLocaleString() || '4,273'}
                        </div>
                        <div className="text-sm text-red-700">Pneumonia Cases</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dataset Distribution</CardTitle>
                  <CardDescription>Normal vs Pneumonia cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <PieChart>
                        <Pie
                          data={chestXrayStats?.distribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(chestXrayStats?.distribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Dataset Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Dataset Details</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Total Images: {loading ? '...' : chestXrayStats?.total_images.toLocaleString() || '5,856'}</li>
                      <li>• Image Format: JPEG</li>
                      <li>• Source: Pediatric patients</li>
                      <li>• Quality Control: Expert physician graded</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Use Cases</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Automated pneumonia detection</li>
                      <li>• Medical AI training</li>
                      <li>• Transfer learning research</li>
                      <li>• Healthcare diagnostics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiny-imagenet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>Tiny-ImageNet-200</span>
                  </CardTitle>
                  <CardDescription>200-class object recognition dataset</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img 
                      src="/images/computer-vision-ai.jpg" 
                      alt="AI computer vision representation"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x300/dbeafe/3b82f6?text=Computer+Vision+Dataset'
                      }}
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : tinyImageNetStats?.total_classes || '200'}
                      </div>
                        <div className="text-xs text-blue-700">Classes</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">64x64</div>
                        <div className="text-xs text-purple-700">Resolution</div>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-xl font-bold text-amber-600">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${(tinyImageNetStats?.total_images || 120000) / 1000}K`}
                      </div>
                        <div className="text-xs text-amber-700">Images</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Data Split Distribution</CardTitle>
                  <CardDescription>Training, validation, and test sets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <BarChart data={tinyImageNetStats?.distribution || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5" />
                  <span>Dataset Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Technical Details</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Image Size: 64×64 pixels</li>
                      <li>• Color Channels: RGB (3 channels)</li>
                      <li>• Classes: {loading ? '...' : tinyImageNetStats?.total_classes || '200'} object categories</li>
                      <li>• Training Images: 500 per class</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Applications</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Object recognition research</li>
                      <li>• CNN architecture testing</li>
                      <li>• Transfer learning experiments</li>
                      <li>• Computer vision benchmarking</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kitti" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-green-500" />
                    <span>KITTI Dataset</span>
                  </CardTitle>
                  <CardDescription>Autonomous driving and computer vision</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img 
                      src="https://placehold.co/600x300/dcfce7/16a34a?text=KITTI+Street+Scenes"
                      alt="KITTI autonomous driving dataset"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Download Progress</span>
                        <span className="text-sm text-gray-600">{kittiProgress}%</span>
                      </div>
                      <Progress value={kittiProgress} className="w-full" />
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Download className="h-4 w-4" />
                        <span>Downloading drive sequences...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dataset Components</CardTitle>
                  <CardDescription>Multi-modal sensor data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <Image className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="font-semibold text-green-700">Camera Images</div>
                        <div className="text-sm text-green-600">Stereo &amp; Color</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <Navigation className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-semibold text-blue-700">LIDAR Data</div>
                        <div className="text-sm text-blue-600">3D Point Clouds</div>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Drive Sequences</h4>
                      <div className="text-sm text-gray-600">
                        Multiple urban and highway scenarios recorded in Karlsruhe, Germany
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Research Applications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Computer Vision Tasks</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>&bull; Stereo vision estimation</li>
                      <li>&bull; Optical flow computation</li>
                      <li>&bull; Object detection &amp; tracking</li>
                      <li>&bull; Scene flow estimation</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Autonomous Driving</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Path planning algorithms</li>
                      <li>• Sensor fusion research</li>
                      <li>• SLAM development</li>
                      <li>• Safety system validation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              ML Dataset Explorer - Interactive visualization of machine learning datasets
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                React + TypeScript
              </Badge>
              <Badge variant="outline" className="text-xs">
                Tailwind CSS
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

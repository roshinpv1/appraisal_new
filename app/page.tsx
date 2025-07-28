'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { AppraisalCategory, AppraisalRating, AppraisalTemplate, AppraisalData, LLMResponse, EmployeeSelfAssessment } from '@/types/appraisal'
import { Plus, Trash2, FileText, Sparkles, User, Users, Settings, ChevronDown, ChevronUp } from 'lucide-react'

// Default appraisal template
const defaultTemplate: AppraisalTemplate = {
  id: 'default',
  name: 'Standard Performance Review',
  description: 'Comprehensive performance evaluation template',
  categories: [
    {
      id: 'technical-skills',
      name: 'Technical Skills',
      description: 'Proficiency in required technical skills and tools',
      weight: 0.25
    },
    {
      id: 'communication',
      name: 'Communication',
      description: 'Effectiveness in verbal and written communication',
      weight: 0.20
    },
    {
      id: 'teamwork',
      name: 'Teamwork & Collaboration',
      description: 'Ability to work effectively in team environments',
      weight: 0.20
    },
    {
      id: 'problem-solving',
      name: 'Problem Solving',
      description: 'Analytical thinking and creative problem-solving abilities',
      weight: 0.20
    },
    {
      id: 'leadership',
      name: 'Leadership & Initiative',
      description: 'Taking initiative and demonstrating leadership qualities',
      weight: 0.15
    }
  ]
}

export default function AppraisalPage() {
  const [template, setTemplate] = useState<AppraisalTemplate>(defaultTemplate)
  const [employeeName, setEmployeeName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [employeeGender, setEmployeeGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say')
  const [ratings, setRatings] = useState<AppraisalRating[]>([])
  const [selfAssessment, setSelfAssessment] = useState<string>('')
  const [overallScore, setOverallScore] = useState(0)
  const [generatedFeedback, setGeneratedFeedback] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeSelfAssessment, setIncludeSelfAssessment] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  // Initialize ratings when template changes
  useEffect(() => {
    const initialRatings: AppraisalRating[] = template.categories.map(category => ({
      categoryId: category.id,
      score: 0,
      comments: ''
    }))
    setRatings(initialRatings)
  }, [template])

  // Update overall score when ratings change
  useEffect(() => {
    if (ratings.length > 0) {
      const totalWeight = template.categories.reduce((sum, category) => sum + category.weight, 0)
      const weightedSum = ratings.reduce((sum, rating) => {
        const category = template.categories.find(c => c.id === rating.categoryId)
        return sum + (rating.score * (category?.weight || 1))
      }, 0)
      const average = totalWeight > 0 ? weightedSum / totalWeight : 0
      setOverallScore(average)
    }
  }, [ratings, template])

  // Update rating for a category
  const updateRating = (categoryId: string, score: number, comments: string) => {
    setRatings(prev => prev.map(rating => 
      rating.categoryId === categoryId 
        ? { ...rating, score, comments }
        : rating
    ))
  }

  // Calculate overall score
  const calculateOverallScore = (newRatings: AppraisalRating[]) => {
    let totalWeightedScore = 0
    let totalWeight = 0

    newRatings.forEach(rating => {
      const category = template.categories.find(c => c.id === rating.categoryId)
      if (category) {
        totalWeightedScore += rating.score * category.weight
        totalWeight += category.weight
      }
    })

    const overall = totalWeight > 0 ? totalWeightedScore / totalWeight : 0
    setOverallScore(overall)
    return overall
  }

  // Update ratings when they change
  useEffect(() => {
    if (ratings.length > 0) {
      calculateOverallScore(ratings)
    }
  }, [ratings, template.categories])

  // Generate feedback using LLM
  const generateFeedback = async () => {
    if (!employeeName || !employeeId || !reviewerName) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch('/api/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName,
          employeeId,
          reviewerName,
          employeeGender,
          template,
          ratings,
          selfAssessment: includeSelfAssessment ? selfAssessment : undefined,
          overallScore
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedFeedback(data.feedback)
      } else {
        alert('Error generating feedback: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error generating feedback')
    }
  }

  // Add new category
  const addCategory = () => {
    const newCategory: AppraisalCategory = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      description: 'Category description',
      weight: 0.1
    }
    
    setTemplate(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }))
  }

  // Remove category
  const removeCategory = (categoryId: string) => {
    setTemplate(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== categoryId)
    }))
    
    setRatings(prev => prev.filter(r => r.categoryId !== categoryId))
  }

  // Update category
  const updateCategory = (categoryId: string, field: keyof AppraisalCategory, value: string | number) => {
    setTemplate(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === categoryId ? { ...c, [field]: value } : c
      )
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Appraisal Feedback Generator
          </h1>
          <p className="text-gray-600">
            Generate comprehensive appraisal feedback for team members with customizable templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter employee and reviewer details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter employee ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Gender
                  </label>
                  <select
                    value={employeeGender}
                    onChange={(e) => setEmployeeGender(e.target.value as 'male' | 'female' | 'other' | 'prefer-not-to-say')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="prefer-not-to-say">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps generate more personalized feedback with appropriate pronouns
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reviewer Name *
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reviewer name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template Management - Collapsible */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <CardTitle>Evaluation Template</CardTitle>
                      <CardDescription>
                        Current template: {template.name} - {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    {showTemplateEditor ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Hide Editor</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Customize Template</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              {showTemplateEditor && (
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={template.name}
                        onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter template name"
                      />
                    </div>
                    <Button onClick={addCategory} size="sm" className="ml-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Description
                    </label>
                    <textarea
                      value={template.description}
                      onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe the purpose and scope of this evaluation template"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Categories</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Define evaluation categories with clear descriptions. These descriptions will be used to generate more contextual and specific feedback.
                    </p>
                    {template.categories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                            placeholder="Category name"
                          />
                          <Button
                            onClick={() => removeCategory(category.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Description
                          </label>
                          <textarea
                            value={category.description}
                            onChange={(e) => updateCategory(category.id, 'description', e.target.value)}
                            className="w-full text-sm text-gray-600 bg-transparent border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
                            placeholder="Describe what this category evaluates and how it should be assessed"
                            rows={2}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Weight:</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.05"
                            value={category.weight}
                            onChange={(e) => updateCategory(category.id, 'weight', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                          <span className="text-sm text-gray-500">({(category.weight * 100).toFixed(0)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Self-Assessment Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Employee Self-Assessment
                </CardTitle>
                <CardDescription>
                  Include employee's self-assessment in the feedback generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeSelfAssessment"
                    checked={includeSelfAssessment}
                    onChange={(e) => setIncludeSelfAssessment(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="includeSelfAssessment" className="text-sm font-medium text-gray-700">
                    Include employee self-assessment in feedback generation
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Employee Self-Assessment */}
            {includeSelfAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Employee Self-Assessment
                  </CardTitle>
                  <CardDescription>
                    Employee's self-evaluation and thoughts about their performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Self-Assessment
                    </label>
                    <Textarea
                      value={selfAssessment}
                      onChange={(e) => setSelfAssessment(e.target.value)}
                      placeholder="Please share your thoughts about your performance, achievements, challenges, and goals for the next period..."
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Manager Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Manager Performance Ratings
                </CardTitle>
                <CardDescription>
                  Rate each category and add comments based on the defined criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {template.categories.map((category) => {
                  const rating = ratings.find(r => r.categoryId === category.id)
                  if (!rating) return null

                  return (
                    <div key={category.id} className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg">{category.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Score: {rating.score.toFixed(1)}/5
                          </label>
                          <span className="text-sm text-gray-500">
                            Weight: {(category.weight * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <Slider
                          value={[rating.score]}
                          onValueChange={(value) => {
                            const newScore = value[0]
                            updateRating(category.id, newScore, rating.comments)
                          }}
                          max={5}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                        
                        <div className="flex space-x-2 text-xs text-gray-500">
                          <span>Poor</span>
                          <span className="flex-1"></span>
                          <span>Excellent</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Manager Comments
                        </label>
                        <Textarea
                          value={rating.comments}
                          onChange={(e) => updateRating(category.id, rating.score, e.target.value)}
                          placeholder={`Add specific comments about ${category.name.toLowerCase()} performance based on: ${category.description}`}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance Score</CardTitle>
                <CardDescription>
                  Weighted average of all category scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {overallScore.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-gray-600">
                    {overallScore >= 4.5 ? 'Outstanding' :
                     overallScore >= 4.0 ? 'Excellent' :
                     overallScore >= 3.5 ? 'Good' :
                     overallScore >= 3.0 ? 'Satisfactory' :
                     overallScore >= 2.0 ? 'Needs Improvement' : 'Poor'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Feedback Button */}
            <Button 
              onClick={generateFeedback}
              disabled={isGenerating || !employeeName || !reviewerName}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Feedback...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Feedback
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Generated Feedback */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Generated Feedback
                </CardTitle>
                <CardDescription>
                  AI-generated comprehensive appraisal feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedFeedback ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed">
                      {generatedFeedback}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => navigator.clipboard.writeText(generatedFeedback)}
                        variant="outline"
                        size="sm"
                      >
                        Copy to Clipboard
                      </Button>
                      <Button 
                        onClick={() => {
                          const blob = new Blob([generatedFeedback], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `appraisal-${employeeName}-${new Date().toISOString().split('T')[0]}.txt`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Generated feedback will appear here</p>
                    <p className="text-sm">Fill in the form and click "Generate Feedback"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 
import { NextRequest, NextResponse } from 'next/server'
import { AppraisalData, LLMResponse } from '@/types/appraisal'
import { LLMClient, createLLMClientFromEnv } from '@/lib/llm-client'

export async function POST(request: NextRequest) {
  try {
    const data: AppraisalData = await request.json()
    
    // Try to use LLM client if available, otherwise fall back to mock feedback
    let feedback: string
    
    try {
      const llmClient = createLLMClientFromEnv()
      
      if (llmClient && llmClient.isAvailable()) {
        const prompt = createFeedbackPrompt(data)
        feedback = await llmClient.callLLM(prompt)
      } else {
        // Fall back to mock feedback if no LLM client is available
        feedback = generateMockFeedback(data)
      }
    } catch (error) {
      console.warn('LLM client failed, falling back to mock feedback:', error)
      feedback = generateMockFeedback(data)
    }
    
    const response: LLMResponse = {
      success: true,
      feedback: feedback
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error generating feedback:', error)
    
    const response: LLMResponse = {
      success: false,
      feedback: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}

function createFeedbackPrompt(data: AppraisalData): string {
  const categoryDetails = data.ratings.map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `${category?.name} (${category?.description}): ${rating.score}/5 - ${rating.comments}`
  }).join('\n')

  let selfAssessmentDetails = ''
  if (data.selfAssessment && data.selfAssessment.length > 0) {
    selfAssessmentDetails = '\n\nEmployee Self-Assessment:\n' + data.selfAssessment.map(assessment => {
      const category = data.template.categories.find(c => c.id === assessment.categoryId)
      return `${category?.name} (${category?.description}):
- Self Score: ${assessment.selfScore}/5
- Self Comments: ${assessment.selfComments}
- Key Achievements: ${assessment.achievements}
- Challenges Faced: ${assessment.challenges}
- Goals for Next Period: ${assessment.goals}`
    }).join('\n\n')
  }

  const categoryDescriptions = data.template.categories.map(category => 
    `• ${category.name}: ${category.description}`
  ).join('\n')

  // Determine appropriate pronouns based on gender
  let pronouns = { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' }
  if (data.employeeGender === 'male') {
    pronouns = { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' }
  } else if (data.employeeGender === 'female') {
    pronouns = { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' }
  }

  return `You are a compassionate and experienced manager writing a performance review for ${data.employeeName}. Write a warm, professional, and humanized feedback that feels like it comes from a caring mentor who truly knows and values this person.

Employee: ${data.employeeName} (ID: ${data.employeeId})
Gender: ${data.employeeGender}
Use these pronouns: ${pronouns.subject}/${pronouns.object}/${pronouns.possessive}

Overall Performance Score: ${data.overallScore.toFixed(2)}/5

Evaluation Categories:
${categoryDescriptions}

Manager's Assessment:
${categoryDetails}${selfAssessmentDetails}

Please write a natural, conversational performance review organized under these four sections:

1. **Success & Achievements** - Highlight their key accomplishments, strengths, and what they've done exceptionally well
2. **Areas for Focus** - Identify specific areas where they can grow and improve, with actionable suggestions
3. **Risk Overlay** - Address any potential challenges, concerns, or areas that need immediate attention
4. **Overall Summary** - Provide a balanced conclusion with encouragement and next steps

Write as if you're having a caring conversation with someone you genuinely want to see succeed. Use natural transitions, avoid corporate jargon, and make it feel like a real human wrote this with care and attention.

Focus on the person, not just the metrics. Show that you see their potential and believe in their growth. Start directly with your observations and feedback - no generic greetings or formalities.`
}

function generateMockFeedback(data: AppraisalData): string {
  const categoryDetails = data.ratings.map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `${category?.name} (${category?.description}): ${rating.score}/5 - ${rating.comments}`
  }).join('\n')

  let selfAssessmentDetails = ''
  if (data.selfAssessment && data.selfAssessment.length > 0) {
    selfAssessmentDetails = '\n\nEmployee Self-Assessment:\n' + data.selfAssessment.map(assessment => {
      const category = data.template.categories.find(c => c.id === assessment.categoryId)
      return `${category?.name} (${category?.description}):
- Self Score: ${assessment.selfScore}/5
- Self Comments: ${assessment.selfComments}
- Key Achievements: ${assessment.achievements}
- Challenges Faced: ${assessment.challenges}
- Goals for Next Period: ${assessment.goals}`
    }).join('\n\n')
  }

  const overallScore = data.overallScore
  const employeeName = data.employeeName
  const reviewerName = data.reviewerName

  // Determine appropriate pronouns based on gender
  let pronouns = { subject: 'they', object: 'them', possessive: 'their', reflexive: 'themselves' }
  if (data.employeeGender === 'male') {
    pronouns = { subject: 'he', object: 'him', possessive: 'his', reflexive: 'himself' }
  } else if (data.employeeGender === 'female') {
    pronouns = { subject: 'she', object: 'her', possessive: 'her', reflexive: 'herself' }
  }

  let performanceLevel = ''
  if (overallScore >= 4.5) performanceLevel = 'Outstanding'
  else if (overallScore >= 4.0) performanceLevel = 'Excellent'
  else if (overallScore >= 3.5) performanceLevel = 'Good'
  else if (overallScore >= 3.0) performanceLevel = 'Satisfactory'
  else if (overallScore >= 2.0) performanceLevel = 'Needs Improvement'
  else performanceLevel = 'Poor'

  // Generate strengths and areas for focus based on ratings
  const strengths = data.ratings.filter(r => r.score >= 4.0).map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `• Your ${category?.name.toLowerCase()} is truly exceptional - you have a natural talent here that sets you apart`
  }).join('\n')

  const focusAreas = data.ratings.filter(r => r.score < 4.0).map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `• ${category?.name} - With some focused effort, you can really excel in this area`
  }).join('\n')

  const risks = data.ratings.filter(r => r.score < 3.0).map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `• ${category?.name} needs immediate attention to prevent it from becoming a significant barrier`
  }).join('\n')

  return `${employeeName}, your performance this period has been ${performanceLevel.toLowerCase()}. Here's my assessment organized to help you understand where you shine and where we can focus our efforts together.

**Success & Achievements**
${strengths || `• Your overall ${performanceLevel.toLowerCase()} performance shows strong potential and dedication to your role`}

**Areas for Focus**
${focusAreas || '• Continue building on your current foundation - there\'s always room for growth'}

**Risk Overlay**
${risks || '• No immediate risks identified - your performance is on a positive trajectory'}

**Overall Summary**
Your ${performanceLevel.toLowerCase()} performance demonstrates that you have what it takes to succeed here. I'm excited about your potential and committed to supporting your continued growth. 

Remember, growth is a journey, and I'm here to help you navigate any challenges you face. I believe in your ability to overcome obstacles and achieve your goals.

Keep up the great work, ${employeeName}. I'm looking forward to seeing what you accomplish in the coming period.

Best regards,
${reviewerName}`
} 
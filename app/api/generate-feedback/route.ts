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
    selfAssessmentDetails = '\n\nEmployee Self-Assessment:\n' + data.selfAssessment
  }

  let additionalComments = ''
  if (data.additionalManagerComments && data.additionalManagerComments.trim()) {
    additionalComments = '\n\nAdditional Manager Comments:\n' + data.additionalManagerComments
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
${categoryDetails}${selfAssessmentDetails}${additionalComments}

CRITICAL INSTRUCTION: Write this performance review in THIRD PERSON ONLY. Never use "you" or "your". Always refer to the employee as "${pronouns.subject}", "${pronouns.object}", or "${pronouns.possessive}". This is a formal performance review document, not a direct conversation.

Please write a natural, professional performance review organized under these four sections:

1. **Success & Achievements** - Highlight ${pronouns.possessive} key accomplishments, strengths, and what ${pronouns.subject} has done exceptionally well
2. **Areas for Focus** - Identify specific areas where ${pronouns.subject} can grow and improve, with actionable suggestions
3. **Risk Overlay** - Address any potential challenges, concerns, or areas that need immediate attention
4. **Overall Summary** - Provide a balanced conclusion with encouragement and next steps

Write as if you're writing about someone you genuinely want to see succeed. Use natural transitions, avoid corporate jargon, and make it feel like a real human wrote this with care and attention.

Focus on the person, not just the metrics. Show that you see ${pronouns.possessive} potential and believe in ${pronouns.possessive} growth. Start directly with your observations and feedback - no generic greetings or formalities.

REMEMBER: Use third-person language throughout. Refer to the employee as "${pronouns.subject}" not "you". This is a formal performance review document.`
}

function generateMockFeedback(data: AppraisalData): string {
  const categoryDetails = data.ratings.map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `${category?.name} (${category?.description}): ${rating.score}/5 - ${rating.comments}`
  }).join('\n')

  let selfAssessmentDetails = ''
  if (data.selfAssessment && data.selfAssessment.length > 0) {
    selfAssessmentDetails = '\n\nEmployee Self-Assessment:\n' + data.selfAssessment
  }

  let additionalComments = ''
  if (data.additionalManagerComments && data.additionalManagerComments.trim()) {
    additionalComments = '\n\nAdditional Manager Comments:\n' + data.additionalManagerComments
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
    return `• ${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} ${category?.name.toLowerCase()} is truly exceptional - ${pronouns.subject} has a natural talent here that sets ${pronouns.object} apart`
  }).join('\n')

  const focusAreas = data.ratings.filter(r => r.score < 4.0).map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `• ${category?.name} - With some focused effort, ${pronouns.subject} can really excel in this area`
  }).join('\n')

  const risks = data.ratings.filter(r => r.score < 3.0).map(rating => {
    const category = data.template.categories.find(c => c.id === rating.categoryId)
    return `• ${category?.name} needs immediate attention to prevent it from becoming a significant barrier`
  }).join('\n')

  // Consider additional manager comments in the feedback
  let additionalContext = ''
  if (data.additionalManagerComments && data.additionalManagerComments.trim()) {
    additionalContext = `\n\nAdditional Context: ${data.additionalManagerComments}`
  }

  return `${employeeName} has demonstrated ${performanceLevel.toLowerCase()} performance this period. Here's the assessment organized to help understand where ${pronouns.subject} shines and where efforts can be focused together.

**Success & Achievements**
${strengths || `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} has shown strong potential and dedication to ${pronouns.possessive} role with ${performanceLevel.toLowerCase()} overall performance`}

**Areas for Focus**
${focusAreas || `${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} can continue building on ${pronouns.possessive} current foundation - there's always room for growth`}

**Risk Overlay**
${risks || `No immediate risks identified - ${pronouns.possessive} performance is on a positive trajectory`}

**Overall Summary**
${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} ${performanceLevel.toLowerCase()} performance demonstrates that ${pronouns.subject} has what it takes to succeed here. The organization is excited about ${pronouns.possessive} potential and committed to supporting ${pronouns.possessive} continued growth. 

Growth is a journey, and the organization is here to help ${pronouns.object} navigate any challenges ${pronouns.subject} faces. There is confidence in ${pronouns.possessive} ability to overcome obstacles and achieve ${pronouns.possessive} goals.

${pronouns.subject.charAt(0).toUpperCase() + pronouns.subject.slice(1)} should keep up the great work and continue to focus on areas for improvement. The organization looks forward to seeing what ${pronouns.subject} accomplishes in the coming period.

Best regards,
${reviewerName}`
} 
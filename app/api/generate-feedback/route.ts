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

Please write a natural, conversational performance review that:

1. **Starts directly** - Jump right into the feedback without generic greetings
2. **Speaks from the heart** - Use natural language that feels personal and caring
3. **Balances praise and growth** - Acknowledge strengths while gently addressing areas for improvement
4. **Shows you know them** - Reference specific examples and observations
5. **Offers genuine support** - Provide encouragement and specific, actionable guidance
6. **Ends with hope** - Close with confidence in their potential and your support

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

  return `${employeeName}, your performance this period has been ${performanceLevel.toLowerCase()}, and I'm genuinely impressed by the growth I've seen in you. You've consistently shown up with a positive attitude and a willingness to tackle challenges head-on.

**What I've Noticed**
${data.ratings.map(rating => {
  const category = data.template.categories.find(c => c.id === rating.categoryId)
  const score = rating.score
  let observation = ''
  
  if (score >= 4.5) observation = `I've been particularly impressed by your ${category?.name.toLowerCase()}. You've really excelled in this area, and it shows in the quality of your work.`
  else if (score >= 4.0) observation = `Your ${category?.name.toLowerCase()} has been strong, and I can see you're putting in real effort here. There's still room to grow, but you're on the right track.`
  else if (score >= 3.5) observation = `In terms of ${category?.name.toLowerCase()}, you're doing well overall. I can see you're working hard, and with a bit more focus, you could really shine in this area.`
  else if (score >= 3.0) observation = `When it comes to ${category?.name.toLowerCase()}, I see potential for growth. This is an area where I believe you can really develop with some targeted effort.`
  else if (score >= 2.0) observation = `I think we both know that ${category?.name.toLowerCase()} is an area where you could use some additional support and development.`
  else observation = `I want to be honest with you about ${category?.name.toLowerCase()} - this is an area where we need to work together to help you improve.`

  return `${observation} ${rating.comments || 'Keep up the good work in this area.'}`
}).join('\n\n')}

**Your Strengths**
${data.ratings.filter(r => r.score >= 4.0).map(rating => {
  const category = data.template.categories.find(c => c.id === rating.categoryId)
  return `• Your ${category?.name.toLowerCase()} is truly a strength - you have a natural talent here that I hope you continue to develop.`
}).join('\n')}

**Areas for Growth**
${data.ratings.filter(r => r.score < 3.5).map(rating => {
  const category = data.template.categories.find(c => c.id === rating.categoryId)
  return `• ${category?.name} is an area where I believe you have real potential for growth. With some focused effort, I'm confident you can excel here.`
}).join('\n')}

**My Recommendations**
${data.ratings.filter(r => r.score < 4.0).map(rating => {
  const category = data.template.categories.find(c => c.id === rating.categoryId)
  return `• For ${category?.name.toLowerCase()}, I'd love to see you ${rating.score < 3.0 ? 'take some time to really focus on developing this skill' : 'continue building on the foundation you\'ve already established'}.`
}).join('\n')}

**Looking Ahead**
I'm excited about your potential and the contributions you can make to our team. Your ${performanceLevel.toLowerCase()} performance shows that you have what it takes to succeed here, and I'm committed to supporting your continued growth.

Remember, growth is a journey, not a destination. I'm here to help you navigate any challenges you face, and I believe in your ability to overcome obstacles and achieve your goals.

Keep up the great work, ${employeeName}. I'm looking forward to seeing what you accomplish in the coming period.

Best regards,
${reviewerName}`
} 
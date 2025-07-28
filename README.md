# Appraisal Feedback Generator

A comprehensive Next.js application for generating professional appraisal feedback for team members with customizable templates and AI-powered feedback generation.

## Features

- **Customizable Templates**: Create and modify evaluation categories with custom weights and detailed descriptions
- **Category Descriptions**: Define specific criteria for each evaluation category to generate more contextual feedback
- **Gender-Specific Feedback**: Include employee gender to generate personalized feedback with appropriate pronouns
- **Natural Language**: Generate warm, conversational feedback that feels like it comes from a caring mentor
- **Structured Feedback**: Organized under four clear categories for better clarity and actionability
- **Slider-based Ratings**: Rate each category on a 0-5 scale with decimal precision
- **Detailed Comments**: Add specific comments for each evaluation category
- **Employee Self-Assessment**: Include employee's perspective with self-scoring and detailed input fields
- **Weighted Scoring**: Automatic calculation of overall performance score
- **AI-Powered Feedback**: Generate comprehensive, professional feedback using LLM integration
- **Contextual Feedback**: AI considers category descriptions to provide more specific and relevant feedback
- **Personalized Pronouns**: Uses appropriate he/him, she/her, or they/them pronouns based on gender selection
- **Humanized Communication**: Feedback sounds natural and caring, avoiding corporate jargon
- **Export Options**: Copy to clipboard or download feedback as text file
- **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Icons**: Lucide React
- **LLM Integration**: TypeScript-based LLM client supporting multiple providers

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd appraisal-feedback-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional, for LLM integration):
```bash
# Create a .env.local file
cp .env.example .env.local

# Add your LLM API keys and configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
# ... other LLM provider configurations
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Workflow

1. **Enter Basic Information**: Fill in employee name, ID, gender, and reviewer name
2. **Customize Template**: Modify evaluation categories, descriptions, and weights (optional)
3. **Rate Performance**: Use sliders to rate each category (0-5 scale)
4. **Add Comments**: Provide specific feedback for each category
5. **Include Self-Assessment**: Optionally include employee's self-evaluation
6. **Generate Feedback**: Click "Generate Feedback" to create comprehensive appraisal
7. **Export Results**: Copy to clipboard or download the generated feedback

### Gender Selection

The system includes gender selection to generate more personalized feedback:

- **Male**: Uses he/him/his pronouns in feedback
- **Female**: Uses she/her/hers pronouns in feedback  
- **Other**: Uses they/them/their pronouns in feedback
- **Prefer not to say**: Uses they/them/their pronouns (default)

This ensures that the generated feedback uses appropriate and respectful language when referring to the employee throughout the appraisal.

### Natural Language Generation

The system generates feedback that feels warm, personal, and genuinely caring:

- **Direct Start**: Jumps right into feedback without generic greetings or formalities
- **Conversational Tone**: Feedback reads like a caring conversation between mentor and mentee
- **Personal Touch**: References specific observations and shows genuine interest in the person
- **Balanced Approach**: Acknowledges strengths while gently addressing growth areas
- **Encouraging Language**: Uses supportive and motivating language throughout
- **Human Connection**: Avoids corporate jargon in favor of natural, relatable language

The feedback is designed to feel like it comes from someone who truly knows and values the employee, focusing on their potential and growth rather than just metrics. It starts directly with observations and feedback, avoiding generic opening statements.

### Structured Feedback Categories

The system organizes feedback under four clear categories for better clarity and actionability:

#### **Success & Achievements**
- Highlights key accomplishments and strengths
- Recognizes exceptional performance areas
- Celebrates what the employee has done exceptionally well
- Builds confidence and motivation

#### **Areas for Focus**
- Identifies specific growth opportunities
- Provides actionable suggestions for improvement
- Focuses on development areas with potential
- Offers constructive guidance for advancement

#### **Risk Overlay**
- Addresses potential challenges and concerns
- Identifies areas that need immediate attention
- Helps prevent issues from becoming barriers
- Ensures proactive problem-solving

#### **Overall Summary**
- Provides a balanced conclusion
- Offers encouragement and support
- Sets clear next steps and expectations
- Reinforces commitment to employee growth

This structured approach ensures that feedback is comprehensive, actionable, and easy to understand and follow up on.

### Template Management

- **Collapsible Editor**: Template customization is hidden by default for a cleaner interface
- **Add Categories**: Click "Customize Template" then "Add Category" to create new evaluation areas
- **Category Descriptions**: Define detailed descriptions for each category to guide the AI feedback generation
- **Customize Weights**: Adjust category weights to reflect importance
- **Edit Descriptions**: Modify category descriptions for clarity and specificity
- **Remove Categories**: Delete unnecessary categories as needed

### Category Descriptions

Each evaluation category should include a detailed description that:
- **Defines the scope**: What aspects of performance this category evaluates
- **Provides criteria**: How the category should be assessed
- **Guides feedback**: Helps the AI generate more specific and relevant feedback

Example category description:
```
"Proficiency in programming languages, debugging, and technical problem-solving abilities. Includes code quality, debugging efficiency, and ability to solve complex technical challenges."
```

### Rating System

- **Slider Control**: Drag sliders to set scores from 0 to 5
- **Decimal Precision**: Supports scores like 3.7, 4.2, etc.
- **Real-time Calculation**: Overall score updates automatically
- **Performance Levels**: Automatic classification (Outstanding, Excellent, Good, etc.)
- **Contextual Comments**: Placeholder text guides users based on category descriptions

### Self-Assessment Integration

- **Toggle Option**: Enable/disable employee self-assessment
- **Self-Scoring**: Employees rate themselves on the same scale
- **Detailed Input**: Include achievements, challenges, and goals
- **Balanced Feedback**: AI considers both manager and employee perspectives
- **Gap Analysis**: Addresses alignment or gaps between perspectives

## LLM Integration

The application supports multiple LLM providers through the TypeScript client:

### Supported Providers

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude models
- **Google Gemini**: Gemini Pro
- **Ollama**: Local models
- **Enterprise**: Custom enterprise LLM endpoints
- **Local**: Any local LLM with OpenAI-compatible API

### Configuration

Set environment variables for your preferred LLM provider:

```bash
# OpenAI
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4

# Anthropic
ANTHROPIC_API_KEY=your_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Google Gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-pro

# Local/Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama-3.2-3b-instruct

# Enterprise
ENTERPRISE_LLM_URL=your_enterprise_endpoint
ENTERPRISE_LLM_API_KEY=your_enterprise_key
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── generate-feedback/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── slider.tsx
│       └── textarea.tsx
├── lib/
│   ├── llm-client.ts
│   └── utils.ts
├── types/
│   └── appraisal.ts
├── package.json
├── tailwind.config.js
└── README.md
```

## API Endpoints

### POST /api/generate-feedback

Generates appraisal feedback based on provided data.

**Request Body:**
```typescript
{
  employeeName: string;
  employeeId: string;
  reviewerName: string;
  template: AppraisalTemplate;
  ratings: AppraisalRating[];
  selfAssessment?: EmployeeSelfAssessment[];
  overallScore: number;
}
```

**Response:**
```typescript
{
  success: boolean;
  feedback: string;
  error?: string;
}
```

## Customization

### Adding New LLM Providers

1. Extend the `LLMProvider` enum in `lib/llm-client.ts`
2. Implement the provider-specific call method in the `LLMClient` class
3. Add configuration in `createConfigForProvider`

### Modifying Templates

Edit the `defaultTemplate` in `app/page.tsx` to change the initial evaluation categories and their descriptions.

### Styling

The application uses Tailwind CSS. Modify `tailwind.config.js` and component styles to customize the appearance.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the repository. 
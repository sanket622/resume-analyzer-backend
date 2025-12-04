const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const analyzeResume = async (resumeContent, jobDescription = null) => {
  try {
    let prompt = '';

    if (jobDescription) {
      prompt = `You are an expert resume analyzer. Analyze the following resume against the provided job description and provide a comprehensive analysis.

RESUME:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Please provide a detailed analysis in the following JSON format:
{
  "overallSummary": "A brief overall summary of the resume and its match with the job description",
  "matchScore": <number between 0-100 representing the match percentage>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missingSkills": ["skill1", "skill2", "skill3"],
  "sectionFeedback": {
    "summary": "Feedback on the resume summary section",
    "experience": "Feedback on the experience section",
    "skills": "Feedback on the skills section",
    "projects": "Feedback on the projects section"
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Be specific, actionable, and professional in your feedback.`;
    } else {
      prompt = `You are an expert resume analyzer. Analyze the following resume and provide comprehensive feedback.

RESUME:
${resumeContent}

Please provide a detailed analysis in the following JSON format:
{
  "overallSummary": "A brief overall summary of the resume",
  "matchScore": null,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "missingSkills": [],
  "sectionFeedback": {
    "summary": "Feedback on the resume summary section",
    "experience": "Feedback on the experience section",
    "skills": "Feedback on the skills section",
    "projects": "Feedback on the projects section"
  },
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Be specific, actionable, and professional in your feedback.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume analyzer and career advisor. Provide detailed, actionable feedback in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0].message.content;
    const analysis = JSON.parse(responseText);

    // Validate and clean the response
    return {
      overallSummary: analysis.overallSummary || 'No summary provided',
      matchScore: jobDescription ? (analysis.matchScore || 0) : null,
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      weaknesses: Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [],
      missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
      sectionFeedback: {
        summary: analysis.sectionFeedback?.summary || 'No feedback provided',
        experience: analysis.sectionFeedback?.experience || 'No feedback provided',
        skills: analysis.sectionFeedback?.skills || 'No feedback provided',
        projects: analysis.sectionFeedback?.projects || 'No feedback provided'
      },
      suggestions: Array.isArray(analysis.suggestions) ? analysis.suggestions : []
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw new Error('Failed to analyze resume: ' + error.message);
  }
};

module.exports = { analyzeResume };


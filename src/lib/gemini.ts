import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateDevotionalReflection(
  topic: string,
  bibleText: string
): Promise<string> {
  if (!aiClient) {
    return `Reflection: As saintly intellectuals in AFIT, meditating on "${topic}" encourages us to align our academic pursuits with divine wisdom. Excellence in engineering and technology begins with a heart yielded to Christ.`;
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a concise 3-sentence spiritual reflection and practical academic application for university campus fellowship students studying at Air Force Institute of Technology based on Topic: "${topic}" and Bible Text: "${bibleText}".`,
    });

    return (
      response.text ||
      'Seek first the kingdom of God and His righteousness in all academic and fellowship endeavors.'
    );
  } catch (err) {
    console.error('Gemini API Error:', err);
    return `Reflection on ${topic}: Strive for spiritual maturity and academic distinction as a witness for Christ in AFIT.`;
  }
}

export async function generateStudyPlan(
  courses: string[],
  targetCgpa: number,
  hoursAvailable: number
): Promise<string> {
  if (!aiClient) {
    return `### Personalized AFIT Study Schedule
**Target CGPA**: ${targetCgpa.toFixed(2)}  
**Weekly Hours**: ${hoursAvailable} hrs  

#### Course Allocation:
${courses
  .map(
    (c) =>
      `- **${c}**: ${Math.max(
        2,
        Math.floor(hoursAvailable / Math.max(courses.length, 1))
      )} hours/week (Focus on tutorial problem sets & past question drill)`
  )
  .join('\n')}

#### Saintly Intellectual Study Strategy:
1. **Spiritual Alignment**: Begin every study session with 5 minutes of prayer for mental clarity and retention.
2. **Active Recall**: Practice past question solving for technical courses.
3. **Peer Collaboration**: Utilize the DLCF AFIT Peer Network to cross-check solutions with senior mentors.`;
  }

  try {
    const prompt = `You are an academic mentor for the Deeper Life Campus Fellowship at AFIT (Air Force Institute of Technology). Create a structured study plan in Markdown format for a student taking the following courses: ${courses.join(', ')}. Target CGPA is ${targetCgpa}, with ${hoursAvailable} study hours per week. Include weekly time blocks, active study methods, and brief Christian spiritual motivation.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'Study plan generated successfully.';
  } catch (err) {
    console.error('Gemini Study Plan Error:', err);
    return `### Recommended Study Schedule
Target CGPA: ${targetCgpa}. Allocated Courses: ${courses.join(', ')}. Focus on consistent weekly review and past question practice.`;
  }
}

export async function generatePersonalStudyPlan(
  topics: string[],
  hoursAvailable: number
): Promise<string> {
  if (!aiClient) {
    return `### Personal Study Schedule
**Weekly Hours:** ${hoursAvailable} hrs

#### Topics
${topics
  .map(
    (topic) =>
      `- **${topic}**: ${Math.max(
        1,
        Math.floor(
          hoursAvailable / Math.max(topics.length, 1)
        )
      )} hour(s)/week`
  )
  .join('\n')}

#### Study Strategy
1. Begin with prayer and a clear objective.
2. Use active recall and spaced review.
3. Include Bible reflection and realistic rest periods.`;
  }

  try {
    const prompt = `Create a personal Bible and study timetable in Markdown for these user-provided topics: ${topics.join(', ')}. The user has ${hoursAvailable} study hours per week. Include practical time blocks, Bible reflection, prayer, active learning, review, and rest. Do not invent course codes or personal details.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'Personal study schedule generated successfully.';
  } catch (error) {
    console.error('Gemini Personal Study Plan Error:', error);
    return `### Personal Study Schedule
Weekly Hours: ${hoursAvailable}
Topics: ${topics.join(', ')}`;
  }
}
// FIX: Implement Gemini API services. This file was previously empty.
import { GoogleGenAI, Type } from "@google/genai";
import { LearningPath, UserProfile, ChatMessage, RecommendedVideo, Module, SmartReview } from '../types';

// FIX: Initialize the Gemini client using `process.env.API_KEY` to adhere to coding guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Define the response schema for the learning path to ensure consistent JSON output from the model.
const learningPathSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        modules: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                    lessons: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                title: { type: Type.STRING },
                                content: { type: Type.STRING },
                                youtube_video_id: { type: Type.STRING },
                                quizzes: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            id: { type: Type.STRING },
                                            title: { type: Type.STRING },
                                            questions: {
                                                type: Type.ARRAY,
                                                items: {
                                                    type: Type.OBJECT,
                                                    properties: {
                                                        questionText: { type: Type.STRING },
                                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                                        correctAnswer: { type: Type.STRING }
                                                    },
                                                    required: ['questionText', 'options', 'correctAnswer']
                                                }
                                            }
                                        },
                                        required: ['id', 'title', 'questions']
                                    }
                                }
                            },
                            required: ['id', 'title', 'content']
                        }
                    }
                },
                required: ['id', 'title', 'description', 'difficulty', 'lessons']
            }
        }
    },
    required: ['title', 'description', 'modules']
};


export const generateLearningPath = async (profile: UserProfile): Promise<LearningPath> => {
    const prompt = `
        Based on the following user profile, create a detailed, personalized learning path.
        The user's current skills are: ${profile.skills.join(', ')}.
        Their career aspiration is: ${profile.career_aspirations}.

        The learning path should be structured with a title, a description, and a series of modules.
        Each module must have an id (e.g., 'module-1'), a title, a description, a difficulty ('Beginner', 'Intermediate', or 'Advanced'), and a list of lessons.
        Each lesson must have an id (e.g., 'module-1-lesson-1'), a title, detailed content in markdown format, an optional youtube_video_id, and an optional list of quizzes.
        Each quiz must have an id (e.g., 'module-1-lesson-1-quiz-1'), a title, and a list of questions.
        Each question must have questionText, an array of options, and the correct answer string.
        The content should be practical, industry-aligned, and suitable for a vocational learner.
        Generate a comprehensive path with at least 3 modules, and each module should have at least 3 lessons.
        Ensure youtube_video_id is a valid-looking YouTube video ID string.
    `;

    try {
        // FIX: Use the recommended 'gemini-2.5-flash' model for text generation tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            // FIX: Use config with responseMimeType and responseSchema for structured JSON output.
            config: {
                responseMimeType: "application/json",
                responseSchema: learningPathSchema
            }
        });

        // FIX: Access the generated text directly from the `.text` property of the response.
        const jsonText = response.text;
        return JSON.parse(jsonText) as LearningPath;
    } catch (error) {
        console.error("Error generating learning path with Gemini:", error);
        throw new Error("Failed to generate learning path from AI service.");
    }
};

const recommendedVideosSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            videoId: { type: Type.STRING },
            thumbnailUrl: { type: Type.STRING }
        },
        required: ['title', 'videoId', 'thumbnailUrl']
    }
};

export const findRelevantYouTubeVideos = async (lessonTitle: string, lessonContent: string): Promise<RecommendedVideo[]> => {
    const prompt = `
        You are an expert curriculum assistant. Find 3-4 highly relevant, popular, and high-view-count educational YouTube videos for the following lesson topic. 
        For each video, provide its title, its unique YouTube video ID, and a thumbnail URL.
        Construct the thumbnail URL using the format 'https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg'. 
        Only choose videos from reputable educational channels.

        Lesson Title: ${lessonTitle}
        Lesson Content Snippet: ${lessonContent.substring(0, 500)}...

        Return the response as a JSON array matching the provided schema. If no suitable videos are found, return an empty array.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendedVideosSchema
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as RecommendedVideo[];
    } catch (error) {
        console.error("Error finding relevant YouTube videos with Gemini:", error);
        return []; // Return an empty array on error to prevent crashes
    }
};


export const streamChatbotResponse = async (
    messages: ChatMessage[],
    input: string,
    pathContext: any,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const systemInstruction = `
        You are EduBot, a helpful and friendly AI assistant for the EDU-AI learning platform.
        Your goal is to assist students with their learning path.
        You should be encouraging and provide clear, concise answers.
        If the user asks about their learning path, use the provided context.
        Current learning path context: ${pathContext ? JSON.stringify(pathContext) : 'Not available.'}
        Keep your responses brief and conversational.
    `;

    const contents = [
        ...history,
        { role: 'user', parts: [{ text: input }] }
    ];

    try {
        // FIX: Use the recommended 'gemini-2.5-flash' model.
        // FIX: Use generateContentStream for streaming responses.
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // FIX: Iterate over the stream and call the onChunk callback with the text from each chunk.
        for await (const chunk of responseStream) {
            // FIX: Ensure chunk.text exists before calling onChunk
            if (chunk && chunk.text) {
                onChunk(chunk.text);
            }
        }
    } catch (error) {
        console.error("Error streaming chatbot response from Gemini:", error);
        onChunk("I'm sorry, I seem to be having some trouble right now. Please try again later.");
    }
};

const smartReviewSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        flashcards: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ['question', 'answer']
            }
        }
    },
    required: ['summary', 'flashcards']
};

export const generateSmartReview = async (module: Module): Promise<SmartReview> => {
    const combinedContent = module.lessons.map(lesson => `Lesson: ${lesson.title}\n${lesson.content}`).join('\n\n---\n\n');

    const prompt = `
        You are an expert educational content creator. Based on the provided content for the module "${module.title}", please generate a smart review package.

        The package should include:
        1.  A concise 'summary' of the key concepts and most important takeaways from the entire module. This should be a single, well-written paragraph.
        2.  A list of 3-5 'flashcards'. Each flashcard should be an object with a 'question' and a 'answer'. The questions should test the most critical information from the module, and the answers should be clear and direct.

        Module Content:
        ${combinedContent}

        Return the response as a JSON object matching the provided schema.
    `;

    try {
        const response = await ai.models.generateContent({
            // FIX: Corrected typo in the model name from 'gem.ini-2.5-flash' to 'gemini-2.5-flash'.
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: smartReviewSchema
            }
        });

        const jsonText = response.text;
        return JSON.parse(jsonText) as SmartReview;
    } catch (error) {
        console.error("Error generating smart review with Gemini:", error);
        throw new Error("Failed to generate smart review from AI service.");
    }
};
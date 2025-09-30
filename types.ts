// FIX: Define all application-wide types in this file to ensure consistency and type safety.

/**
 * Defines the roles available in the application.
 * - student: A learner using the platform.
 * - trainer: An instructor who can monitor students.
 * - admin: An administrator with user management capabilities.
 */
export type Role = 'student' | 'trainer' | 'admin';

/**
 * Defines the difficulty levels for learning modules.
 */
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/**
 * Represents a user's profile, containing their skills and career goals.
 */
export interface UserProfile {
    skills: string[];
    career_aspirations: string;
}

/**
 * Represents a user of the application, combining auth data with profile and progress.
 */
export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    points: number;
    badges: string[]; // Array of badge IDs
    completed_lessons: string[]; // Array of lesson IDs
    is_locked: boolean;
    profile: UserProfile;
}

/**
 * Represents an unlockable badge for gamification.
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

/**
 * Represents a single question within a quiz.
 */
export interface QuizQuestion {
    questionText: string;
    options: string[];
    correctAnswer: string;
}

/**
 * Represents a quiz associated with a lesson.
 */
export interface Quiz {
    id: string;
    title: string;
    questions: QuizQuestion[];
}

/**
 * Represents a single lesson within a module.
 */
export interface Lesson {
    id: string;
    title: string;
    content: string; // Markdown content for the lesson
    youtube_video_id?: string;
    quizzes?: Quiz[];
}

/**
 * Represents a module of lessons within a learning path.
 */
export interface Module {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    lessons: Lesson[];
}

/**
 * Represents the entire personalized learning path generated for a user.
 */
export interface LearningPath {
    title: string;
    description: string;
    modules: Module[];
}

/**
 * Represents a job recommendation (schema defined but not used in current UI).
 */
export interface JobRecommendation {
    title: string;
    company: string;
    location: string;
    url: string;
}

/**
 * Represents an entry on the leaderboard.
 */
export interface LeaderboardEntry {
    id: string;
    rank: number;
    name: string;
    points: number;
    badges: string[];
}

/**
 * Represents a message in the chatbot interface.
 */
export interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

/**
 * Represents a recommended YouTube video for a lesson.
 */
export interface RecommendedVideo {
    title: string;
    videoId: string;
    thumbnailUrl: string;
}
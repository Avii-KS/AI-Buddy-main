import { supabase } from '../lib/supabase';
import { classifier } from './classifier';
import { promptEngine } from './promptEngine';
import { llmService } from './llmService';
import { Response, ClassificationResult } from '../types';

const isSupabaseEnabled = !!supabase;

export class AIService {
  async processQuery(studentId: string, queryText: string): Promise<{ response: Response; classification: ClassificationResult }> {
    try {
      const classification = classifier.classify(queryText);

      const queryData = {
        student_id: studentId,
        query_text: queryText,
        detected_intent: classification.intent,
        detected_language: classification.language,
        detected_age_group: classification.ageGroup,
        detected_subject: classification.subject,
        complexity_level: classification.complexity
      };

      // Insert query when Supabase is configured; otherwise create a mock record
      let insertedQuery: any = null;
      if (isSupabaseEnabled) {
        const { data, error } = await supabase!
          .from('queries')
          .insert([queryData])
          .select()
          .maybeSingle();
        if (error) {
          console.error('Query insert error:', error);
          throw new Error(`Failed to save query: ${error.message}`);
        }
        insertedQuery = data;
        if (!insertedQuery) {
          throw new Error('Failed to save query - no data returned');
        }
      } else {
        insertedQuery = { id: crypto.randomUUID(), ...queryData, created_at: new Date().toISOString() };
      }

      const prompt = promptEngine.buildPrompt(queryText, classification);
      const { text, tokens, timeMs } = await llmService.generateResponse(prompt);
      const formattedText = promptEngine.formatResponse(text);

      const responseData = {
        query_id: insertedQuery.id,
        template_used: `${classification.intent}_${classification.language}_${classification.ageGroup.toLowerCase()}`,
        response_text: formattedText,
        generation_time_ms: timeMs,
        tokens_used: tokens
      };

      // Insert response when Supabase is configured; otherwise return a mock response
      let insertedResponse: any = null;
      if (isSupabaseEnabled) {
        const { data, error } = await supabase!
          .from('responses')
          .insert([responseData])
          .select()
          .maybeSingle();
        if (error) {
          console.error('Response insert error:', error);
          throw new Error(`Failed to save response: ${error.message}`);
        }
        insertedResponse = data;
        if (!insertedResponse) {
          throw new Error('Failed to save response - no data returned');
        }
      } else {
        insertedResponse = {
          id: crypto.randomUUID(),
          ...responseData,
          created_at: new Date().toISOString()
        };
      }

      return {
        response: insertedResponse as Response,
        classification
      };
    } catch (error) {
      console.error('Error in processQuery:', error);
      // Even if persistence fails, try to return a response so UX isn't blocked
      const fallbackClassification = classifier.classify(queryText);
      const prompt = promptEngine.buildPrompt(queryText, fallbackClassification);
      const { text } = await llmService.generateResponse(prompt);
      return {
        response: {
          id: crypto.randomUUID(),
          query_id: crypto.randomUUID(),
          response_text: promptEngine.formatResponse(text),
          generation_time_ms: 0,
          tokens_used: 0,
          created_at: new Date().toISOString()
        },
        classification: fallbackClassification
      };
    }
  }

  async submitFeedback(responseId: string, feedback: {
    rating?: number;
    thumbsUp?: boolean;
    comment?: string;
    timeSpent?: number;
    followUpAsked?: boolean;
    activityCompleted?: boolean;
  }) {
    try {
      if (!isSupabaseEnabled) {
        // No-op when Supabase isn't configured
        return;
      }
      const { error } = await supabase!.from('feedback').insert([{
        response_id: responseId,
        rating: feedback.rating,
        thumbs_up: feedback.thumbsUp,
        comment: feedback.comment,
        time_spent_seconds: feedback.timeSpent,
        follow_up_asked: feedback.followUpAsked,
        activity_completed: feedback.activityCompleted
      }]);

      if (error) {
        throw new Error(`Failed to save feedback: ${error.message}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // don't throw to avoid breaking UI when feedback save fails
    }
  }

  async getStudentHistory(studentId: string) {
    try {
      if (!isSupabaseEnabled) return [];

      const { data, error } = await supabase!
        .from('queries')
        .select(`
          *,
          responses (*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  async getAnalytics() {
    try {
      if (!isSupabaseEnabled) return [];

      const { data, error } = await supabase!
        .from('analytics_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }
  }
}

export const aiService = new AIService();

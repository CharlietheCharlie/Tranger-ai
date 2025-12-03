
import { describe, it, expect, vi } from 'vitest';
import { generateTrip } from '../../services/geminiService';

// Mock the GoogleGenAI class structure
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    Type: { 
      OBJECT: 'OBJECT', 
      ARRAY: 'ARRAY', 
      STRING: 'STRING', 
      INTEGER: 'INTEGER' 
    }
  };
});

describe('geminiService', () => {
  it('should parse a valid AI response and return an Itinerary structure', async () => {
    // Mock Response from Gemini
    const mockAIResponse = {
      text: JSON.stringify({
        tripName: "Amazing Tokyo",
        days: [
          {
            dayOffset: 1,
            activities: [
              {
                title: "Senso-ji",
                description: "Ancient temple",
                startTime: "10:00",
                duration: 90,
                location: "Asakusa",
                tags: ["Culture"]
              }
            ]
          }
        ]
      })
    };

    mockGenerateContent.mockResolvedValue(mockAIResponse);

    const result = await generateTrip(['Tokyo', 'Japan'], 1);

    expect(result.name).toBe('Amazing Tokyo');
    expect(result.days).toHaveLength(1);
    expect(result.days![0].activities[0].title).toBe('Senso-ji');
    expect(result.days![0].activities[0].tags).toContain('Culture');
  });

  it('should handle API errors gracefully', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API Failure'));

    await expect(generateTrip(['Nowhere'], 1)).rejects.toThrow('API Failure');
  });
});

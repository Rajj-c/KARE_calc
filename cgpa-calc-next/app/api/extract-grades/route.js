import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        // Get the API key from environment variables
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Google AI API key not configured' },
                { status: 500 }
            );
        }

        // Get the file data from the request
        const formData = await request.formData();
        const files = formData.getAll('file'); // Get all files

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Prepare content parts for Gemini (prompt + images)
        const contentParts = [];

        // Add the prompt first
        contentParts.push(`
Analyze these KARE university grade card images (there may be multiple pages) and extract ALL course information.
Combine data from ALL pages into a single list.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.

Structure the response exactly like this:
{
  "studentName": "extract from grade card if visible (use the most complete name found)",
  "semesters": [
    {
      "semester": 1,
      "courses": [
        {
          "code": "211BIT1101",
          "name": "Biology for Engineers",
          "credits": 3.0,
          "grade": "C"
        }
      ]
    }
  ],
  "totalCGPA": 7.54
}

Rules:
1. Extract ALL courses from ALL provided images
2. Group courses by semester number
3. Convert credits to numbers (e.g., "3.0" -> 3.0)
4. Include course code, name, credits, and grade
5. Skip rows with empty grades or invalid data
6. Extract the final CGPA shown at the bottom (if visible on any page)
7. Return ONLY the JSON object, no other text
`);

        // Process each file
        for (const file of files) {
            // Convert file to base64
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64 = buffer.toString('base64');
            const mimeType = file.type;

            // Add image part
            contentParts.push({
                inlineData: {
                    data: base64,
                    mimeType: mimeType
                }
            });
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash as it's the working model for this key
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Send the prompt and all images to Gemini
        const result = await model.generateContent(contentParts);

        const response = await result.response;
        const text = response.text();

        // Clean up the response - remove markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/```\n?/g, '');
        }

        // Parse the JSON response
        const extractedData = JSON.parse(cleanText);

        // Usage Validation: Ensure structure matches what frontend expects
        if (!extractedData.semesters || !Array.isArray(extractedData.semesters)) {
            extractedData.semesters = [];
        }

        return NextResponse.json({
            success: true,
            data: extractedData,
            method: 'gemini'
        });

    } catch (error) {
        console.error('Error extracting grades:', error);

        let errorMessage = 'Failed to extract grades from the image';
        let suggestion = 'Try the PDF Upload or OCR method as alternatives';

        if (error.message.includes('API key')) {
            errorMessage = 'Invalid API key. Please check your Google AI API key.';
        } else if (error.message.includes('quota') || error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
            errorMessage = '⚠️ Gemini API quota exceeded. Please try the PDF Upload or OCR Upload method instead.';
            suggestion = 'The PDF and OCR methods work offline and have no quota limits';
        } else if (error instanceof SyntaxError) {
            errorMessage = 'Failed to parse grade card. The image might be unclear.';
            suggestion = 'Try uploading a clearer image or use the OCR method';
        }

        return NextResponse.json(
            {
                error: errorMessage,
                details: error.message,
                suggestion: suggestion
            },
            { status: 500 }
        );
    }
}

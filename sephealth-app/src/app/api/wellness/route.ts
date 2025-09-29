import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

// For now, we'll create a simple model inline since we haven't created the WellnessAssessment model yet
import mongoose from 'mongoose';

const WellnessAssessmentSchema = new mongoose.Schema({
  email: String,
  responses: [String],
  summary: String,
  createdAt: { type: Date, default: Date.now }
});

const WellnessAssessment = mongoose.models.WellnessAssessment || 
  mongoose.model('WellnessAssessment', WellnessAssessmentSchema);

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { email, responses, summary } = await req.json();

    // Create new wellness assessment
    const newAssessment = new WellnessAssessment({
      email: email || 'anonymous',
      responses,
      summary,
    });

    await newAssessment.save();

    return NextResponse.json(
      { success: true, message: 'Wellness assessment saved successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Wellness assessment error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
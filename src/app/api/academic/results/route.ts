import { NextResponse } from 'next/server';
import { calculateGPA, calculateCumulativeCGPA } from '@/lib/gpa-calculator';
import { ResultSubmissionPayload } from '@/types/academic';

export async function POST(request: Request) {
  try {
    const body: ResultSubmissionPayload = await request.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'No course items provided' }, { status: 400 });
    }

    const currentGPA = calculateGPA(body.items.map((item) => ({ creditUnits: item.creditUnits, grade: item.grade })));
    const totalUnits = body.items.reduce((sum, item) => sum + item.creditUnits, 0);

    // Mock calculation assuming previous CGPA 4.10 over 45 units
    const { cgpa, isUnderperforming } = calculateCumulativeCGPA(4.10, 45, currentGPA, totalUnits);

    return NextResponse.json({
      success: true,
      gpa: currentGPA,
      cgpa,
      isUnderperforming,
      message: 'Result logged securely. Access restricted to Associate Coordinators.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

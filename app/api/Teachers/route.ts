import { connectToDatabase } from '@/lib/dbConnect';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const teachers = await db.collection('Teacher_data').find().toArray(); // Use your collection name here

    return NextResponse.json({ data: teachers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'error', error }, { status: 500 });
  }
}

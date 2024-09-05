import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from '@/lib/dbConnect';
import { ObjectId } from 'mongodb';

interface UpdateBody {
  Score: number;
  gamesPlayed: number;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await connectToDatabase();
  const body: UpdateBody = await req.json();
  const { Score, gamesPlayed } = body;

  try {
    const result = await db.collection('Teacher_data').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: { Score, gamesPlayed } },
      { returnDocument: 'after' }
    );

    if (result.value) {
      return NextResponse.json({ message: 'Document updated successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

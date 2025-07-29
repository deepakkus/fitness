import { NextRequest, NextResponse } from 'next/server';
//import { getServerSession } from 'next-auth';
//import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getToken } from "next-auth/jwt";
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user || !session.user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
    
      if (!token || !token.user || !token.user.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    //const user_id = parseInt(session.user.id, 10);
    const user_id = BigInt(token.user.id);
    const { keywords, location, date, get_post, get_events } = await req.json();
    const prefDate = date ? new Date(date) : new Date();
    let updateData: any = {
      pref_keyword: keywords,
      pref_location: location,
      get_post: get_post ?? 0,
      get_events: get_events ?? 0,
	  pref_data: prefDate,
    };
    
    let createData: any = {
      user_id: user_id,
      pref_keyword: keywords,
      pref_location: location,
      get_post: get_post ?? 0,
      get_events: get_events ?? 0,
	  pref_data: prefDate,
    };
    console.log("CreateData:", createData);
    let pref;
    const existing = await prisma.preferences.findFirst({ where: { user_id } });
    if (existing) {
      pref = await prisma.preferences.update({
        where: { id: existing.id },
        data: updateData,
      });
    } else {
      pref = await prisma.preferences.create({
        data: createData,
      });
    }
    return NextResponse.json({ success: true, pref });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user || !session.user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    // const user_id = parseInt(session.user.id, 10);

    const token = await getToken({ req: req, secret: process.env.NEXTAUTH_SECRET });
    
      if (!token || !token.user || !token.user.id) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
    //const user_id = parseInt(session.user.id, 10);
    const user_id = BigInt(token.user.id);
    const pref = await prisma.preferences.findFirst({ where: { user_id } });
    return NextResponse.json({ pref });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 
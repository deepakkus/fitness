// File: /app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendActivityAcceptanceEmail } from "@/lib/emailUtils";

export async function POST(request: NextRequest) {
    try {
        // Only allow in development environment
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: "Test endpoint only available in development mode" }, { status: 403 });
        }

        // Get test data from request body
        const data = await request.json();
        
        // Validate required fields
        if (!data.email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Send a test email
        const success = await sendActivityAcceptanceEmail(
            data.email,
            data.name || "Test User",
            {
                title: data.title || "Test Activity",
                location: data.location || "Test Location",
                startTime: data.startTime ? new Date(data.startTime) : new Date(),
                endTime: data.endTime ? new Date(data.endTime) : new Date(Date.now() + 3600000),
                description: data.description || "This is a test activity description."
            }
        );

        if (success) {
            return NextResponse.json({ 
                message: "Test email sent successfully", 
                recipient: data.email 
            });
        } else {
            return NextResponse.json({ 
                error: "Failed to send test email. Check server logs for details." 
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Error sending test email:", error);
        return NextResponse.json({ 
            error: "An error occurred while sending the test email",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
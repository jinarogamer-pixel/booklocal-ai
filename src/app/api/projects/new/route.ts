import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod validation schema
const ProjectSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    phone: z.string().optional(),
    sqft: z.number().int().min(50, "Minimum 50 sqft").optional(),
    city: z.string().min(2, "City is required").optional(),
    state: z.string().optional(),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code").optional(),
    notes: z.string().max(2000, "Notes must be under 2000 characters").optional(),
    finish: z.enum(["oak", "tile", "concrete"]).optional(),
    providerId: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const json = await req.json();

        // Convert string sqft to number if needed
        if (json.sqft && typeof json.sqft === 'string') {
            json.sqft = parseInt(json.sqft, 10) || undefined;
        }

        const parsed = ProjectSchema.safeParse(json);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "validation_error",
                    message: parsed.error.issues[0]?.message || "Validation failed",
                    issues: parsed.error.flatten()
                },
                { status: 400 }
            );
        }

        const data = parsed.data;

        // TODO: Replace with actual Supabase integration
        // Example Supabase insertion:
        /*
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: inserted, error } = await supabase
          .from("projects")
          .insert([{
            title: `${data.finish ? data.finish.charAt(0).toUpperCase() + data.finish.slice(1) : 'New'} Project`,
            description: data.notes,
            customer_name: data.name,
            customer_email: data.email,
            customer_phone: data.phone,
            location: [data.city, data.state].filter(Boolean).join(", "),
            zip_code: data.zip,
            budget_min: data.sqft ? Math.floor(data.sqft * 8) : null,
            budget_max: data.sqft ? Math.floor(data.sqft * 16) : null,
            preferred_finish: data.finish,
            preferred_provider_id: data.providerId,
            status: 'submitted',
            created_at: new Date().toISOString(),
          }])
          .select("id")
          .single();
        
        if (error) {
          console.error("Supabase error:", error);
          return NextResponse.json(
            { ok: false, error: "database_error", message: "Failed to save project" },
            { status: 500 }
          );
        }
        */

        // Mock response for now
        const mockProjectId = `proj_${Math.random().toString(36).substring(2, 10)}`;

        // Optional: Send notification email here
        console.log("New project submitted:", {
            id: mockProjectId,
            name: data.name,
            email: data.email,
            location: [data.city, data.state].filter(Boolean).join(", "),
            finish: data.finish,
        });

        return NextResponse.json({
            ok: true,
            projectId: mockProjectId,
            message: "Project submitted successfully"
        });

    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            {
                ok: false,
                error: "server_error",
                message: "Internal server error"
            },
            { status: 500 }
        );
    }
}

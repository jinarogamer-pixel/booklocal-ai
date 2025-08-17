import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'serviceType', 'zipCode', 'description'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create lead object
    const lead = {
      id: `lead_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'customer_lead',
      name: body.name,
      email: body.email,
      phone: body.phone,
      serviceType: body.serviceType,
      zipCode: body.zipCode,
      description: body.description,
      urgency: body.urgency || 'medium',
      source: 'website_form',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Log the lead (in production, this would go to a database)
    console.log('New customer lead received:', lead);

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to customer
    // 4. Trigger contractor matching process

    // For MVP, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send email notification (mock implementation)
    const emailData = {
      to: process.env.ADMIN_EMAIL || 'admin@booklocal.com',
      subject: `New BookLocal Lead: ${lead.serviceType} in ${lead.zipCode}`,
      html: `
        <h2>New Customer Lead</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Service:</strong> ${lead.serviceType}</p>
        <p><strong>ZIP Code:</strong> ${lead.zipCode}</p>
        <p><strong>Urgency:</strong> ${lead.urgency}</p>
        <p><strong>Description:</strong></p>
        <p>${lead.description}</p>
        <p><strong>Timestamp:</strong> ${lead.timestamp}</p>
        <p><strong>Lead ID:</strong> ${lead.id}</p>
      `
    };

    // Mock email sending (in production, use SendGrid, AWS SES, etc.)
    console.log('Email notification sent:', emailData);

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Lead captured successfully'
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
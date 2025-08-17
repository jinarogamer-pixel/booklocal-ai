import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'serviceType', 'experience', 'zipCode', 'hasLicense', 'hasInsurance'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Create contractor application object
    const application = {
      id: `contractor_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'contractor_application',
      name: body.name,
      email: body.email,
      phone: body.phone,
      businessName: body.businessName || '',
      serviceType: body.serviceType,
      experience: body.experience,
      zipCode: body.zipCode,
      hasLicense: body.hasLicense,
      hasInsurance: body.hasInsurance,
      source: 'website_form',
      status: 'pending_review',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // Log the application (in production, this would go to a database)
    console.log('New contractor application received:', application);

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to contractor
    // 4. Trigger background check process if applicable

    // For MVP, we'll just simulate success
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send email notification (mock implementation)
    const emailData = {
      to: process.env.ADMIN_EMAIL || 'admin@booklocal.com',
      subject: `New Contractor Application: ${application.serviceType} - ${application.name}`,
      html: `
        <h2>New Contractor Application</h2>
        <p><strong>Name:</strong> ${application.name}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Phone:</strong> ${application.phone}</p>
        <p><strong>Business Name:</strong> ${application.businessName || 'Individual'}</p>
        <p><strong>Service Type:</strong> ${application.serviceType}</p>
        <p><strong>Experience:</strong> ${application.experience}</p>
        <p><strong>ZIP Code:</strong> ${application.zipCode}</p>
        <p><strong>Has License:</strong> ${application.hasLicense}</p>
        <p><strong>Has Insurance:</strong> ${application.hasInsurance}</p>
        <p><strong>Timestamp:</strong> ${application.timestamp}</p>
        <p><strong>Application ID:</strong> ${application.id}</p>
        <hr>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Review application within 48 hours</li>
          <li>Schedule phone interview if qualified</li>
          <li>Request documentation (license, insurance, etc.)</li>
          <li>Add to contractor database if approved</li>
        </ul>
      `
    };

    // Mock email sending (in production, use SendGrid, AWS SES, etc.)
    console.log('Email notification sent:', emailData);

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error processing contractor application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
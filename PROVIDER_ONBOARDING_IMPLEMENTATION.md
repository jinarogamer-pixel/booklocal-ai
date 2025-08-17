# 🔧 PROVIDER ONBOARDING IMPLEMENTATION GUIDE

**Status:** CRITICAL - No Real Verification APIs Connected
**Priority:** P0 - Required for Launch
**Timeline:** 2-3 weeks

---

## 🚨 CURRENT STATE ANALYSIS

### ❌ WHAT'S MISSING (CRITICAL)
1. **No Real OCR/ID Verification** - Jumio/Onfido not connected
2. **No Background Check API** - Checkr/Sterling placeholders only  
3. **No License Verification** - Florida DBPR not integrated
4. **No Insurance Verification** - Carrier APIs not connected
5. **No Document Storage** - AWS S3/Cloudinary not configured
6. **No KYC/AML Compliance** - Persona.com not integrated

### ✅ WHAT EXISTS (FOUNDATION)
1. **UI Components** - Complete onboarding flow exists
2. **Database Schema** - Tables for verification data ready
3. **Webhook Handlers** - Skeleton code for provider responses
4. **File Upload Logic** - Frontend ready for document uploads

---

## 📋 IMPLEMENTATION ROADMAP

### **PHASE 1: DOCUMENT STORAGE (Week 1)**

#### 1.1 AWS S3 Setup
```bash
# Create S3 bucket for document storage
aws s3 mb s3://booklocal-verification-docs
aws s3api put-bucket-encryption \
  --bucket booklocal-verification-docs \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

#### 1.2 Environment Variables
```bash
# Add to .env.local
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=booklocal-verification-docs
```

#### 1.3 File Upload Service
Update `src/lib/fileUpload.ts`:
```typescript
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadVerificationDocument(
  file: File, 
  userId: string, 
  documentType: string
): Promise<string> {
  const key = `verification/${userId}/${documentType}/${uuidv4()}-${file.name}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: file,
    ContentType: file.type,
    ServerSideEncryption: 'AES256',
    Metadata: {
      userId,
      documentType,
      uploadedAt: new Date().toISOString()
    }
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}
```

### **PHASE 2: ID VERIFICATION (Week 1-2)**

#### 2.1 Jumio Account Setup
1. Sign up at jumio.com
2. Get API credentials from dashboard
3. Configure webhook endpoint

#### 2.2 Environment Variables
```bash
JUMIO_API_TOKEN=your_jumio_api_token
JUMIO_API_SECRET=your_jumio_api_secret  
JUMIO_DATACENTER=US
```

#### 2.3 Update Verification Service
Modify `src/lib/verification.ts`:
```typescript
async initiateVerification(userId: string, userEmail: string) {
  // Remove mock check - force real API
  if (!this.apiToken || !this.apiSecret) {
    throw new Error('Jumio credentials required for production');
  }

  // Real implementation continues...
}
```

#### 2.4 Webhook Handler
Update `src/app/api/webhooks/jumio/route.ts`:
```typescript
import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const payload = await request.json();
  
  // Verify webhook signature
  const signature = request.headers.get('x-jumio-signature');
  if (!verifyJumioSignature(payload, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Process verification result
  const { idScanReference, verificationStatus, extractedData } = payload;
  
  await supabase
    .from('verification_documents')
    .update({
      verification_status: verificationStatus === 'APPROVED_VERIFIED' ? 'approved' : 'rejected',
      verified_at: new Date().toISOString(),
      metadata: { extractedData, jumioResponse: payload }
    })
    .eq('metadata->>jumio_scan_reference', idScanReference);

  return Response.json({ success: true });
}
```

### **PHASE 3: BACKGROUND CHECKS (Week 2)**

#### 3.1 Checkr Account Setup  
1. Sign up at checkr.com
2. Complete business verification
3. Get API key from dashboard

#### 3.2 Environment Variables
```bash
CHECKR_API_KEY=your_checkr_api_key
CHECKR_ENVIRONMENT=sandbox # or production
```

#### 3.3 Background Check Service
Create `src/lib/backgroundCheck.ts`:
```typescript
export class CheckrService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CHECKR_API_KEY!;
    this.baseUrl = process.env.CHECKR_ENVIRONMENT === 'production' 
      ? 'https://api.checkr.com/v1'
      : 'https://api.checkr.com/v1';
  }

  async createCandidate(contractorData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    ssn: string;
    zipCode: string;
  }) {
    const response = await fetch(`${this.baseUrl}/candidates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: contractorData.firstName,
        last_name: contractorData.lastName,
        email: contractorData.email,
        phone: contractorData.phone,
        dob: contractorData.dob,
        ssn: contractorData.ssn,
        zipcode: contractorData.zipCode
      })
    });

    if (!response.ok) {
      throw new Error(`Checkr API error: ${response.status}`);
    }

    return await response.json();
  }

  async createReport(candidateId: string, reportType: string = 'standard') {
    const response = await fetch(`${this.baseUrl}/reports`, {
      method: 'POST', 
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: reportType
      })
    });

    return await response.json();
  }
}
```

### **PHASE 4: LICENSE VERIFICATION (Week 2-3)**

#### 4.1 Florida DBPR Integration
Research Florida Department of Business and Professional Regulation API:
- Contact DBPR for API access requirements
- Implement license lookup by number
- Set up automated verification checks

#### 4.2 Manual Verification Fallback
```typescript
export async function verifyFloridaLicense(
  licenseNumber: string,
  licenseType: string
): Promise<LicenseVerification> {
  try {
    // Try automated API first
    const apiResult = await checkFloridaDBPR(licenseNumber, licenseType);
    if (apiResult) return apiResult;
  } catch (error) {
    console.log('DBPR API unavailable, using manual verification');
  }

  // Fallback to manual verification queue
  await supabase
    .from('manual_verification_queue')
    .insert({
      license_number: licenseNumber,
      license_type: licenseType,
      status: 'pending_manual_review',
      priority: 'high'
    });

  return {
    license_number: licenseNumber,
    license_type: licenseType,
    license_state: 'FL',
    status: 'pending_verification',
    verified_at: new Date().toISOString(),
    issuing_authority: 'Florida DBPR (Manual Review)'
  };
}
```

### **PHASE 5: INSURANCE VERIFICATION (Week 3)**

#### 5.1 Insurance Carrier APIs
Research and integrate:
- State Farm API
- Allstate API  
- Progressive API
- Generic certificate validation

#### 5.2 Certificate OCR
Use Google Vision API or AWS Textract:
```typescript
import { TextractClient, AnalyzeDocumentCommand } from '@aws-sdk/client-textract';

export async function extractInsuranceData(documentUrl: string) {
  const textract = new TextractClient({ region: 'us-east-1' });
  
  const command = new AnalyzeDocumentCommand({
    Document: { S3Object: { Bucket: 'bucket', Name: 'key' } },
    FeatureTypes: ['FORMS', 'TABLES']
  });

  const response = await textract.send(command);
  
  // Parse insurance certificate data
  return {
    carrierName: extractField(response, 'INSURER'),
    policyNumber: extractField(response, 'POLICY NUMBER'),
    effectiveDate: extractField(response, 'POLICY EFF DATE'),
    expirationDate: extractField(response, 'POLICY EXP DATE'),
    coverageAmount: extractField(response, 'GENERAL LIABILITY')
  };
}
```

---

## 🧪 TESTING STRATEGY

### **Unit Testing**
```typescript
// __tests__/verification.test.ts
describe('Verification Services', () => {
  test('Jumio verification initiation', async () => {
    const result = await jumioService.initiateVerification('user123', 'test@example.com');
    expect(result.redirectUrl).toBeDefined();
  });

  test('Background check creation', async () => {
    const candidate = await checkrService.createCandidate(mockContractorData);
    expect(candidate.id).toBeDefined();
  });
});
```

### **Integration Testing**  
```typescript
// __tests__/onboarding-flow.test.ts
describe('Complete Onboarding Flow', () => {
  test('Full contractor verification pipeline', async () => {
    // 1. Upload documents
    const documentUrl = await uploadVerificationDocument(mockFile, 'user123', 'drivers_license');
    
    // 2. Initiate ID verification
    const verification = await initiateJumioVerification('user123', 'test@example.com');
    
    // 3. Create background check
    const backgroundCheck = await createBackgroundCheck(mockContractorData);
    
    // 4. Verify license
    const licenseCheck = await verifyFloridaLicense('CRC123456', 'General Contractor');
    
    expect(documentUrl).toBeDefined();
    expect(verification.success).toBe(true);
    expect(backgroundCheck.id).toBeDefined();
    expect(licenseCheck.status).toBe('active');
  });
});
```

---

## 📊 SUCCESS METRICS

### **Verification Completion Rates**
- ID Verification: >95% completion
- Background Check: >90% pass rate  
- License Verification: >98% accuracy
- Insurance Verification: >95% valid certificates

### **Performance Targets**
- Document upload: <30 seconds
- ID verification initiation: <5 seconds
- Background check results: <24 hours
- License verification: <1 hour (automated) or <48 hours (manual)

---

## 🚨 COMPLIANCE REQUIREMENTS

### **Data Protection**
- Encrypt all PII at rest and in transit
- Implement data retention policies
- GDPR/CCPA compliance for data deletion
- Audit logs for all verification activities

### **Florida Legal Requirements**
- Chapter 489 contractor licensing compliance
- FDUTPA consumer protection compliance  
- Proper independent contractor classification
- Insurance requirement verification

---

## 🎯 IMMEDIATE NEXT STEPS

1. **This Week**: Set up AWS S3 and Jumio accounts
2. **Next Week**: Implement real ID verification flow
3. **Week 3**: Add Checkr background checks
4. **Week 4**: Florida license verification + insurance

**CRITICAL**: Do not launch without at least ID verification and background checks working with real APIs.

---

*This implementation guide represents the actual work needed to move from prototype to production-ready verification system.*
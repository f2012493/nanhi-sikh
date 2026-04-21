# NanhiSikh - AI-Powered Children's Video Story Platform

## Overview

NanhiSikh is a full-stack web application that generates personalized, animated story videos for Indian children. Parents describe their child and a parenting challenge, and the platform uses AI to create a unique story where the child is the hero, naturally teaching important lessons.

## Platform Architecture

### Technology Stack

- **Frontend**: React 19 + Tailwind CSS 4 + TypeScript
- **Backend**: Express.js + tRPC + Node.js
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Manus OAuth
- **Payment**: Razorpay (GST-inclusive INR pricing)
- **AI/ML**: OpenAI GPT-4, Image Generation API, ElevenLabs TTS
- **File Storage**: S3-compatible storage
- **Video Processing**: FFmpeg (planned)

### Project Structure

```
nanhi-sikh/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── CreateStory.tsx       # 5-step story wizard
│   │   │   ├── Dashboard.tsx         # Parent dashboard
│   │   │   └── Pricing.tsx           # Pricing page
│   │   ├── components/               # Reusable UI components
│   │   ├── lib/trpc.ts              # tRPC client
│   │   └── App.tsx                  # Router setup
│   └── index.html
├── server/
│   ├── routers/
│   │   ├── story.ts                 # Story creation & generation
│   │   └── payment.ts               # Payment processing
│   ├── db.ts                        # Database query helpers
│   ├── routers.ts                   # Main router
│   └── _core/                       # Framework plumbing
├── drizzle/
│   ├── schema.ts                    # Database schema
│   └── migrations/                  # SQL migrations
└── shared/                          # Shared types & constants
```

## Features Implemented

### ✅ Phase 1: Project Setup & Database
- Database schema with story orders, character uploads, render jobs, and feedback tables
- Drizzle ORM migrations and query helpers
- Full TypeScript support

### ✅ Phase 2: Landing Page
- Emotional hero section targeting Indian parents
- 3-step explainer: Describe → Personalize → Watch & Share
- Testimonials from Indian parents
- Trust badges and social proof
- Responsive design for mobile and desktop

### ✅ Phase 3: Story Creation Wizard (5 Steps)
1. **Child Details**: Name, age, gender, photo upload, language selection
2. **Parenting Challenge**: Free-text input with example chips (Won't share toys, Scared of dark, Hits when angry)
3. **Supporting Characters**: Upload up to 3 additional character photos
4. **Customization**: Animation style (cartoon, storybook, magical) and music mood
5. **Review & Generate**: Story script preview with editing capability

### ✅ Phase 4: AI Story Generation
- GPT-4 story script generation (10-scene JSON structure)
- Strict schema enforcement: narration, visualDescription, characterAction, hiddenLesson
- Language support: English, Hindi, Hinglish

### ✅ Phase 5: Payment Integration
- Razorpay payment gateway integration
- Three pricing tiers:
  - **Preview**: ₹99 (watermarked, 7-day access)
  - **HD**: ₹299 (full HD, no watermark, 30-day access)
  - **HD + WhatsApp**: ₹399 (HD + direct WhatsApp delivery, unlimited access)
- GST-inclusive pricing display in Indian Rupees

### ✅ Phase 6: Parent Dashboard
- List of user's created stories
- Story status tracking (generating, completed, failed)
- WhatsApp sharing integration
- Feedback system ("Story worked!", "Partially worked", "Didn't work")
- Video playback capability

### ✅ Phase 7: Backend API
- tRPC procedures for story creation
- Story script generation with GPT-4
- Payment status tracking
- Feedback submission

## Database Schema

### Users Table
- Extends Manus OAuth user data
- Fields: id, openId, name, email, role, createdAt, updatedAt, lastSignedIn

### Story Orders Table
- Stores all story creation requests
- Fields: childName, childAge, childGender, childPhotoUrl, language, parentingChallenge, animationStyle, musicMood, videoLength, storyScript, videoUrl, renderStatus, paymentStatus, pricingTier, amountPaid, razorpayOrderId, razorpayPaymentId

### Character Uploads Table
- Stores supporting character photos
- Fields: storyOrderId, characterName, characterRole, photoUrl, photoKey

### Render Jobs Table
- Tracks video generation progress
- Fields: storyOrderId, jobId, status, progress, currentStep, errorMessage, completedAt

### Story Feedback Table
- Stores parent feedback on story effectiveness
- Fields: storyOrderId, feedbackType (worked/partial/not_worked), notes, createdAt

### Photo Delete Log Table
- Tracks auto-deletion of child photos (COPPA/DPDP compliance)
- Fields: photoKey, photoType (child/character), storyOrderId, deletedAt

## API Endpoints (tRPC Procedures)

### Story Router (`/api/trpc/story.*`)
- `create`: Create new story order
- `getById`: Get specific story by ID
- `getUserStories`: Get all stories for current user
- `generateScript`: Generate AI story script (10 scenes)
- `startRender`: Start video rendering job
- `getRenderStatus`: Get render job status
- `submitFeedback`: Submit story effectiveness feedback

### Payment Router (`/api/trpc/payment.*`)
- `getPricingTiers`: Get available pricing tiers
- `createOrder`: Create Razorpay order
- `verifyPayment`: Verify payment signature
- `getPaymentStatus`: Get payment status for story

### Auth Router (`/api/trpc/auth.*`)
- `me`: Get current user
- `logout`: Logout user

## Remaining Implementation Tasks

### Video Generation Pipeline
- [ ] AI scene image generation (maintaining child face consistency)
- [ ] ElevenLabs TTS integration for voiceover narration
- [ ] FFmpeg video stitching and composition
- [ ] Async job queue for rendering (Bull/BullMQ)
- [ ] Render progress tracking and status polling

### File Storage & Compliance
- [ ] S3 file upload handlers for child and character photos
- [ ] Auto-deletion policy for child photos (30 days)
- [ ] COPPA compliance measures
- [ ] DPDP (India) compliance measures
- [ ] Privacy policy and terms of service pages

### Database Seeding
- [ ] Seed 3 demo stories in English
- [ ] Seed 3 demo stories in Hindi
- [ ] Demo scenarios: Won't share toys, Scared of dark, Hits when angry

### Payment Completion
- [ ] Razorpay webhook integration for payment callbacks
- [ ] HMAC signature verification
- [ ] Payment success/failure handling
- [ ] Refund processing

### Demo Video Integration
- [ ] Add looping demo story preview videos on landing page
- [ ] Create 3 sample videos showcasing the platform

## Environment Variables

### Required (Auto-configured)
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Session cookie signing secret
- `VITE_APP_ID`: Manus OAuth application ID
- `OAUTH_SERVER_URL`: Manus OAuth backend URL
- `BUILT_IN_FORGE_API_URL`: Manus built-in APIs URL
- `BUILT_IN_FORGE_API_KEY`: Manus API key (server-side)
- `VITE_FRONTEND_FORGE_API_KEY`: Manus API key (client-side)

### Required for Payment (To be configured)
- `RAZORPAY_KEY_ID`: Razorpay public key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

### Optional (For future features)
- `ELEVENLABS_API_KEY`: ElevenLabs TTS API key
- `AWS_ACCESS_KEY_ID`: S3 access key
- `AWS_SECRET_ACCESS_KEY`: S3 secret key
- `AWS_S3_BUCKET`: S3 bucket name

## Testing

### Running Tests
```bash
pnpm test
```

### Test Coverage
- Story router validation tests
- Payment tier validation tests
- Auth logout tests

## Deployment

The project is configured for deployment on Manus hosting:
1. Create a checkpoint via the Management UI
2. Click the "Publish" button to deploy
3. Custom domain support available in Settings → Domains

## Compliance & Privacy

### COPPA (Children's Online Privacy Protection Act)
- Child photos are auto-deleted after 30 days
- No tracking or profiling of children
- Parental consent required for story creation

### DPDP (Digital Personal Data Protection - India)
- Data localization for Indian users
- Explicit consent for data collection
- Right to deletion implemented
- Privacy policy and terms of service required

## Future Enhancements

1. **Multi-language Support**: Expand beyond English, Hindi, Hinglish
2. **Advanced Personalization**: Use child's interests and learning style
3. **Parent Community**: Forum for sharing stories and tips
4. **Weekly Suggestions**: AI-powered story recommendations
5. **Subscription Model**: Monthly story packages
6. **Mobile App**: Native iOS/Android apps
7. **Live Storytelling**: Real-time interactive stories
8. **Educator Integration**: Use in schools and daycare centers

## Support & Feedback

For issues, feature requests, or feedback, please contact support@nanhisikh.com or visit our help center.

---

**Last Updated**: April 21, 2026
**Version**: 1.0.0 (Beta)

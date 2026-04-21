# NanhiSikh - Project TODO

## Phase 1: Project Setup & Database Schema
- [x] Create database schema for users, story orders, character uploads, render jobs, and feedback
- [x] Set up Drizzle ORM migrations
- [x] Create database query helpers in server/db.ts
- [ ] Configure environment variables for all external APIs (OpenAI, image generation, TTS, Razorpay, S3, Twilio)

## Phase 2: Landing Page
- [x] Design and implement hero section with emotional hook for Indian parents
- [x] Create 3-step explainer section (Describe → Personalize → Watch & Share)
- [ ] Add looping demo story preview videos (3 demo stories)
- [x] Add testimonials section from Indian parents
- [x] Add trust badges section
- [x] Implement responsive design for mobile and desktop

## Phase 3: Story Creation Wizard (5 Steps)
- [x] Step 1: Child details form (name, age, gender, photo upload, language selection)
- [x] Step 2: Parenting challenge input with example chips
- [x] Step 3: Supporting character uploads (up to 3 additional characters)
- [x] Step 4: Animation style and music mood selection
- [x] Step 5: Story script preview with editing capability
- [x] Implement form state management and validation
- [ ] Create file upload handlers with image optimization

## Phase 4: AI Story Generation & Video Rendering
- [x] Implement GPT-4 story script generation (10-scene JSON structure)
- [ ] Create scene image generation using AI image model
- [ ] Implement child face consistency across scenes (InsightFace/IP-Adapter)
- [ ] Integrate ElevenLabs TTS for voiceover narration
- [ ] Implement FFmpeg video stitching pipeline
- [ ] Create async job queue for video rendering
- [ ] Add render progress tracking and status polling

## Phase 5: Payment Integration
- [ ] Integrate Razorpay payment gateway
- [ ] Implement three pricing tiers (preview watermarked, HD, HD + WhatsApp delivery)
- [ ] Create checkout flow with GST-inclusive pricing display
- [ ] Implement HMAC signature verification for payment callbacks
- [ ] Store order and payment metadata in database

## Phase 6: Video Delivery & Sharing
- [ ] Implement in-app video streaming
- [ ] Create downloadable video links
- [ ] Integrate Twilio for WhatsApp sharing
- [ ] Implement Instagram Reels share functionality

## Phase 7: Parent Dashboard
- [x] Create dashboard layout with saved videos
- [x] Implement re-watch capability
- [x] Add WhatsApp and Instagram share buttons
- [x] Implement 'Story worked!' feedback button
- [ ] Create weekly story suggestion engine

## Phase 8: File Storage & Compliance
- [ ] Implement S3 file storage for photos and videos
- [ ] Create auto-deletion policy for child photos (30 days)
- [ ] Implement COPPA and DPDP compliance measures
- [ ] Add privacy policy and terms of service pages
- [ ] Implement data retention and deletion tracking

## Phase 9: Database Seeding
- [ ] Seed database with 3 demo stories in English
- [ ] Seed database with 3 demo stories in Hindi
- [ ] Include demo stories: 'Won't share toys', 'Scared of the dark', 'Hits when angry'

## Phase 10: Testing & Deployment
- [ ] Write vitest unit tests for backend procedures
- [ ] Test story generation with various inputs
- [ ] Test payment flow and order creation
- [ ] Test file uploads and storage
- [ ] Test video rendering pipeline
- [ ] Perform end-to-end testing of complete user flow
- [ ] Create checkpoint and prepare for deployment

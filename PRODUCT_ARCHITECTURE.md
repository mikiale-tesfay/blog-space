# Blog Space Product Architecture

## Executive Assessment

### Current product shape

`blog-space` currently combines two partially overlapping products:

1. A campus social network: posts, profiles, comments, likes, follows, groups, chat, notifications, image uploads, and a generic home feed.
2. A class-based learning platform: classes, teachers, students, subjects, chapters, topics, resources, quizzes, assessments, submissions, and role-specific dashboards.

The learning platform has the stronger product spine because it has a complete domain hierarchy:

`Class -> Subject -> Chapter -> Topic -> Resource -> Quiz/Assessment -> Submission`

The social features do not yet have an equally specific job. They currently behave like a second product inside the same navigation shell.

### Recommended product

Make the product an **institutional learning hub with contextual community**.

> Teachers publish structured course content and assessments to classes; students discover material, complete work, track progress, and discuss it in one place.

The primary value loop is:

`Enroll -> Learn -> Practice -> Submit -> Review -> Discuss`

Posts become announcements and discussions attached to an institution, class, subject, or resource. This preserves the useful community behavior without allowing a generic blog feed to define the product.

### Keep, merge, defer, remove

| Area | Decision | Product role |
| --- | --- | --- |
| Auth, users, teacher/student roles | Keep and normalize | Identity and access |
| Classes, enrollment, subjects, chapters, topics | Keep and make canonical | Academic structure |
| Resources and media uploads | Keep, consolidate | Learning content |
| Quizzes, assessments, submissions | Keep, unify lifecycle | Practice and evaluation |
| Posts, comments, likes | Merge into Community | Contextual announcements and discussions |
| Follows and generic social feed | Defer | Revisit only if a clear academic use case appears |
| Direct messaging | Keep as supporting feature | Class or participant communication |
| AI chat | Defer behind an explicit learning use case | Study assistant, not a second home page |
| Notifications | Keep after core workflows stabilize | Assignment, grade, and announcement events |
| Groups | Defer or map to class cohorts | Avoid a second membership model |
| `BestSellings`, generic landing experiments, duplicate profiles | Remove from active navigation | Unrelated to the learning promise |

## Evidence From the Current Codebase

### Backend domains

- Identity: `models/userModel.js`, `controllers/userControler.js`, `middleware/authMiddleware.js`, `routes/usersRoute.js`.
- Community: `models/postModel.js`, `models/comments.js`, `models/likes.js`, `models/followModel.js`, `routes/postsRoute.js`, `routes/comments.js`, `routes/likes.js`, `routes/follows.js`.
- Communication: `models/chatModel.js`, `models/message.js`, `models/notificationModel.js`, `routes/chatRoutes.js`.
- Academic administration: `models/class.js`, `models/students.js`, `models/teachers.js`, `models/groupModel.js`, `routes/class.js`, `routes/students.js`, `routes/teacherRoutes.js`.
- Curriculum: `models/curricullum/*`, `routes/subjects.js`, `routes/chapterRoutes.js`, `routes/topics.js`.
- Learning content: `models/resource.js`, `models/resourceModel.js`, `controllers/resource.js`, `routes/resource.js`, and Cloudinary configuration.
- Evaluation: `models/quizModel.js`, `models/assessmentModel.js`, `controllers/assessment.js`, `routes/assessments.js`.

### Frontend domains

`src/App.jsx` exposes the same application as a public feed, generic blog, teacher dashboard, student dashboard, academy pages, practice pages, image upload screens, AI chat, and a best-selling page. The academic surface is duplicated across `pages/accademy`, `pages/TeacherDashboard`, `pages/studentDashboard`, and `components/layout`.

## Root Risks To Resolve First

1. **Duplicate resource schemas:** `models/resource.js` includes `classId` and media arrays; `models/resourceModel.js` omits `classId` and differs in field optionality. Choose one canonical aggregate.
2. **Inconsistent academic relationships:** `Class` stores subjects, `Teacher` stores classes and a subject, and `subjectClassTeacher` also models assignment. Replace these competing sources with `Enrollment` and `TeachingAssignment`.
3. **Incomplete resource lifecycle:** resource update and delete controller paths are empty. A published learning platform needs draft, publish, update, archive, and delete behavior with ownership checks.
4. **Incomplete assessment API:** submission logic exists in the controller but is not fully exposed by the assessment route module.
5. **Frontend/backend contract drift:** verify paths used by the frontend against registered routes before moving files. Known examples include teacher profile, quiz submission, and resource-by-type calls.
6. **Community schema drift:** frontend behavior expects announcement and pinning semantics that are not represented in `postModel.js`. Replace implicit flags with an explicit `CommunityItem` type.
7. **Authorization gaps:** `protect` is used inconsistently where teacher, student, and admin permissions are required. Centralize role and resource ownership policies.

## Target Directory Tree

### Backend

```text
backend/
  src/
    app.js
    server.js
    config/
      db.js
      cloudinary.js
    middleware/
      auth.js
      roles.js
      error.js
      validate.js
    modules/
      auth/
        auth.controller.js
        auth.routes.js
        auth.service.js
        user.model.js
      users/
        profile.controller.js
        profile.routes.js
        profile.model.js
      institutions/
        institution.model.js
        enrollment.model.js
        teachingAssignment.model.js
        institution.routes.js
      curriculum/
        class.model.js
        subject.model.js
        chapter.model.js
        topic.model.js
        curriculum.controller.js
        curriculum.routes.js
      resources/
        resource.model.js
        resource.controller.js
        resource.routes.js
        resource.service.js
      assessments/
        quiz.model.js
        assessment.model.js
        submission.model.js
        assessment.controller.js
        assessment.routes.js
      community/
        announcement.model.js
        discussion.model.js
        comment.model.js
        reaction.model.js
        community.controller.js
        community.routes.js
      messaging/
        conversation.model.js
        message.model.js
        notification.model.js
        messaging.controller.js
        messaging.routes.js
    shared/
      errors/
      uploads/
      validation/
      pagination/
  tests/
    integration/
    unit/
```

### Frontend

```text
frontend/my-app/src/
  app/
    router.jsx
    providers/
  layouts/
    PublicLayout.jsx
    StudentLayout.jsx
    TeacherLayout.jsx
    AdminLayout.jsx
  features/
    auth/
    classes/
    curriculum/
      SubjectPage.jsx
      ChapterPage.jsx
      TopicPage.jsx
    resources/
      ResourceViewer.jsx
      ResourceEditor.jsx
    assessments/
      StudentAssessmentsPage.jsx
      TeacherAssessmentsPage.jsx
      QuizAttemptPage.jsx
      SubmissionReviewPage.jsx
    community/
      AnnouncementFeedPage.jsx
      DiscussionPage.jsx
      CreateAnnouncementPage.jsx
    messaging/
    notifications/
    profiles/
  components/
    ui/
    forms/
    media/
    feedback/
  services/
    apiClient.js
    authApi.js
    curriculumApi.js
    resourceApi.js
    assessmentApi.js
    communityApi.js
  stores/
    authStore.js
    classStore.js
  tests/
```

## Canonical Domain Model

Use these relationships as the source of truth:

```text
Institution
  ├── User
  ├── Class ──< Enrollment >── StudentProfile/User
  ├── TeachingAssignment >── TeacherProfile/User
  └── Class ──< Subject ──< Chapter ──< Topic ──< Resource
                                              ├── Quiz ──< Submission
                                              └── Assessment ──< Submission

CommunityItem -> Institution + optional Class/Subject/Resource + author
Discussion     -> CommunityItem + replies
Conversation   -> participants + optional Class/Subject context
```

Do not use posts, groups, follows, or embedded class arrays as alternate ownership or membership systems.

## Route Grouping

Move toward these API boundaries while preserving temporary compatibility aliases during migration:

```text
/api/auth/*
/api/users/*
/api/institutions/:institutionId/classes/*
/api/classes/:classId/curriculum/*
/api/classes/:classId/resources/*
/api/classes/:classId/assessments/*
/api/classes/:classId/submissions/*
/api/community/*
/api/conversations/*
/api/notifications/*
```

Every protected route should declare one of: public, authenticated, student, teacher, or admin. Resource and submission routes must also enforce class membership and ownership.

## Phased Refactoring Checklist

### Phase 0: Baseline and contracts

- [ ] Freeze current behavior and record reachable frontend routes.
- [ ] Inventory frontend API calls and compare them with backend route registration.
- [ ] Add request logging, correlation IDs, validation errors, and a health endpoint.
- [ ] Add smoke tests for login, class loading, resource loading, quiz loading, and dashboard routing.

### Phase 1: Establish boundaries without changing behavior

- [ ] Add `backend/src/modules` and frontend feature folders.
- [ ] Move files by domain with compatibility imports; avoid changing API payloads in this phase.
- [ ] Create one API client and feature-level API modules instead of scattered Axios calls.
- [ ] Introduce role middleware and a shared authorization policy helper.

### Phase 2: Normalize identity and academic membership

- [ ] Keep `User` as the authentication identity and make teacher/student profiles role-specific extensions.
- [ ] Introduce `Enrollment` for student-class membership.
- [ ] Introduce `TeachingAssignment` for teacher-class-subject membership.
- [ ] Migrate reads from embedded class/subject arrays, then remove those fields after verification.

### Phase 3: Consolidate curriculum and resources

- [ ] Select `models/resource.js` as the starting point, then migrate the useful fields from `resourceModel.js` into one schema.
- [ ] Use one resource container per topic only if that invariant is intentional; otherwise model individual resources with a `topicId` index.
- [ ] Implement resource draft, publish, update, archive, and delete operations.
- [ ] Standardize media metadata and move upload behavior behind a resource service.
- [ ] Add class membership and teacher ownership checks to every resource mutation.

### Phase 4: Consolidate evaluation

- [ ] Separate quiz/assessment definitions from student attempts and submissions.
- [ ] Expose create, publish, attempt, submit, grade, and review routes.
- [ ] Make submission ownership and one-attempt/multiple-attempt policy explicit.
- [ ] Add tests for unauthorized access, duplicate submissions, grading, and score visibility.

### Phase 5: Rebuild community around learning

- [ ] Replace generic `Post` usage with `Announcement` and `Discussion` types.
- [ ] Require a scope: institution, class, subject, or resource.
- [ ] Keep comments and reactions as supporting modules; defer follows and generic discovery feeds.
- [ ] Remove unsupported bookmark behavior or implement it as a deliberate saved-resource feature.

### Phase 6: Unify frontend workflows

- [ ] Replace duplicate `accademy` and dashboard screens with the role layouts and feature pages above.
- [ ] Make the student home page class progress first, with scoped announcements below it.
- [ ] Make the teacher home page publishing, assessment, and grading first.
- [ ] Remove active navigation to `BestSellings`, duplicate profile flows, abandoned resource pages, and experimental landing screens.
- [ ] Keep direct chat and notifications behind class/context links.

### Phase 7: Production hardening

- [ ] Add integration coverage for auth, roles, enrollment, resources, assessment attempts, submissions, and community scope.
- [ ] Add frontend smoke coverage for teacher publish and student complete flows.
- [ ] Add pagination and indexes for class, topic, resource, assessment, and community queries.
- [ ] Add upload size/type limits, malware scanning or provider validation, audit fields, rate limits, and secure CORS configuration.
- [ ] Add structured logs, error monitoring, backups, migration scripts, and a rollback plan.

## Definition Of Done

The refactor is complete when a new user can register, join a class, open a subject, read a resource, take an assessment, submit work, and see scoped discussion without entering a generic social workflow. A teacher can publish the same path from one dashboard, and every action is covered by role and membership authorization.
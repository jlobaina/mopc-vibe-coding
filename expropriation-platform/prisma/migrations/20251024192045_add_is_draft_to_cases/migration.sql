-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "parentId" TEXT,
    "description" TEXT,
    "headUserId" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "departments_headUserId_fkey" FOREIGN KEY ("headUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "resource" TEXT,
    "action" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isGranted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "suspensionReason" TEXT,
    "suspendedAt" DATETIME,
    "suspendedBy" TEXT,
    "lastLoginAt" DATETIME,
    "lastLoginIp" TEXT,
    "lastLoginUserAgent" TEXT,
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME,
    "passwordChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "jobTitle" TEXT,
    "bio" TEXT,
    "officeLocation" TEXT,
    "workingHours" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'es',
    "timezone" TEXT NOT NULL DEFAULT 'America/Santo_Domingo',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "backupCodes" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "emailDigest" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "dateRange" TEXT,
    "dashboardConfig" TEXT,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "departmentId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastAccessAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "password_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passwordHash" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedBy" TEXT,
    "changeReason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "password_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_department_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" TEXT,
    CONSTRAINT "user_department_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_department_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "currentStage" TEXT NOT NULL DEFAULT 'RECEPCION_SOLICITUD',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedEndDate" DATETIME,
    "actualEndDate" DATETIME,
    "propertyAddress" TEXT NOT NULL,
    "propertyCity" TEXT NOT NULL,
    "propertyProvince" TEXT NOT NULL,
    "propertyDescription" TEXT,
    "propertyCoordinates" TEXT,
    "propertyArea" REAL,
    "propertyType" TEXT,
    "ownerName" TEXT NOT NULL,
    "ownerIdentification" TEXT,
    "ownerContact" TEXT,
    "ownerEmail" TEXT,
    "ownerAddress" TEXT,
    "ownerType" TEXT,
    "estimatedValue" REAL,
    "actualValue" REAL,
    "appraisalValue" REAL,
    "compensationAmount" REAL,
    "currency" TEXT NOT NULL DEFAULT 'DOP',
    "expropriationDecree" TEXT,
    "judicialCaseNumber" TEXT,
    "legalStatus" TEXT,
    "progressPercentage" REAL NOT NULL DEFAULT 0,
    "deletedAt" DATETIME,
    "deletedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "supervisedById" TEXT,
    CONSTRAINT "cases_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cases_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cases_supervisedById_fkey" FOREIGN KEY ("supervisedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileHash" TEXT,
    "documentType" TEXT NOT NULL DEFAULT 'OTHER',
    "category" TEXT NOT NULL DEFAULT 'ADMINISTRATIVE',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "securityLevel" TEXT NOT NULL DEFAULT 'INTERNAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryptionKey" TEXT,
    "tags" TEXT,
    "metadata" JSONB,
    "customFields" JSONB,
    "expiresAt" DATETIME,
    "archivedAt" DATETIME,
    "archivedBy" TEXT,
    "retentionPeriod" INTEGER,
    "contentText" TEXT,
    "isIndexed" BOOLEAN NOT NULL DEFAULT false,
    "indexedAt" DATETIME,
    "thumbnailPath" TEXT,
    "previewGenerated" BOOLEAN NOT NULL DEFAULT false,
    "storageType" TEXT NOT NULL DEFAULT 'LOCAL',
    "storageLocation" TEXT,
    "backupLocation" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" DATETIME,
    "lastAccessedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "caseId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "parentId" TEXT,
    "templateId" TEXT,
    "categoryId" TEXT,
    CONSTRAINT "documents_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "documents_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "document_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "documents_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "document_category_refs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "case_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "previousValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "duration" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    CONSTRAINT "case_histories_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "case_histories_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "caseId" TEXT,
    CONSTRAINT "activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "activities_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "case_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "case_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "case_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meetingType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "location" TEXT,
    "virtual" BOOLEAN NOT NULL DEFAULT false,
    "meetingUrl" TEXT,
    "dialInInfo" TEXT,
    "room" TEXT,
    "equipment" JSONB,
    "scheduledStart" DATETIME NOT NULL,
    "scheduledEnd" DATETIME NOT NULL,
    "actualStart" DATETIME,
    "actualEnd" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'America/Santo_Domingo',
    "plannedDuration" INTEGER NOT NULL,
    "actualDuration" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" JSONB,
    "parentMeetingId" TEXT,
    "maxParticipants" INTEGER,
    "allowGuests" BOOLEAN NOT NULL DEFAULT true,
    "requireApproval" BOOLEAN NOT NULL DEFAULT false,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "recordMeeting" BOOLEAN NOT NULL DEFAULT false,
    "enableChat" BOOLEAN NOT NULL DEFAULT true,
    "enableScreenShare" BOOLEAN NOT NULL DEFAULT true,
    "organizerId" TEXT NOT NULL,
    "chairId" TEXT,
    "invitedCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "attendedCount" INTEGER NOT NULL DEFAULT 0,
    "effectiveness" TEXT,
    "agendaTemplateId" TEXT,
    "minutesTemplate" TEXT,
    "tags" TEXT,
    "metadata" JSONB,
    "cancelledAt" DATETIME,
    "cancelledBy" TEXT,
    "cancellationReason" TEXT,
    "rescheduledFrom" DATETIME,
    "rescheduledTo" DATETIME,
    "rescheduledBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "caseId" TEXT,
    CONSTRAINT "meetings_parentMeetingId_fkey" FOREIGN KEY ("parentMeetingId") REFERENCES "meetings" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meetings_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meetings_chairId_fkey" FOREIGN KEY ("chairId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meetings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meetings_agendaTemplateId_fkey" FOREIGN KEY ("agendaTemplateId") REFERENCES "meeting_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "organization" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ATTENDEE',
    "rsvpStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "rsvpAt" DATETIME,
    "rsvpNotes" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" DATETIME,
    "leftAt" DATETIME,
    "attendanceDuration" INTEGER,
    "spokeCount" INTEGER NOT NULL DEFAULT 0,
    "questionsAsked" INTEGER NOT NULL DEFAULT 0,
    "commentsMade" INTEGER NOT NULL DEFAULT 0,
    "canEditAgenda" BOOLEAN NOT NULL DEFAULT false,
    "canUploadDocs" BOOLEAN NOT NULL DEFAULT false,
    "canVote" BOOLEAN NOT NULL DEFAULT false,
    "canInviteOthers" BOOLEAN NOT NULL DEFAULT false,
    "delegatedTo" TEXT,
    "delegatedFrom" TEXT,
    "delegationReason" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "lastReminderAt" DATETIME,
    "followUpSent" BOOLEAN NOT NULL DEFAULT false,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "accessCode" TEXT,
    "accessLink" TEXT,
    "expiresAt" DATETIME,
    "invitedBy" TEXT NOT NULL,
    "invitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_participants_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_participants_delegatedFrom_fkey" FOREIGN KEY ("delegatedFrom") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_participants_delegatedTo_fkey" FOREIGN KEY ("delegatedTo") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_agenda_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "plannedDuration" INTEGER NOT NULL,
    "actualDuration" INTEGER,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "presenterId" TEXT,
    "ownerId" TEXT,
    "content" TEXT,
    "materials" JSONB,
    "preparation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "outcome" TEXT,
    "actionItems" TEXT,
    "requiresVote" BOOLEAN NOT NULL DEFAULT false,
    "votingSessionId" TEXT,
    "decisionId" TEXT,
    "allowDiscussion" BOOLEAN NOT NULL DEFAULT true,
    "discussionTime" INTEGER,
    "dependsOn" TEXT,
    "blockedBy" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_agenda_items_presenterId_fkey" FOREIGN KEY ("presenterId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_agenda_items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_agenda_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_agenda_items_votingSessionId_fkey" FOREIGN KEY ("votingSessionId") REFERENCES "voting_sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_agenda_items_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "meeting_decisions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_decisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "agendaItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "decisionType" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "proposal" TEXT,
    "rationale" TEXT,
    "alternatives" TEXT,
    "impact" TEXT,
    "implementation" TEXT,
    "votingMethod" TEXT,
    "votingSessionId" TEXT,
    "voteResult" JSONB,
    "consensusLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "approvedAt" DATETIME,
    "implementedAt" DATETIME,
    "caseId" TEXT,
    "expedienteId" TEXT,
    "departmentId" TEXT,
    "effectiveDate" DATETIME,
    "reviewDate" DATETIME,
    "expiryDate" DATETIME,
    "supportingDocs" JSONB,
    "attachments" JSONB,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpStatus" TEXT,
    "followUpItems" JSONB,
    "proposedBy" TEXT NOT NULL,
    "proposedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "reviewedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_decisions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_decisions_votingSessionId_fkey" FOREIGN KEY ("votingSessionId") REFERENCES "voting_sessions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_decisions_proposedBy_fkey" FOREIGN KEY ("proposedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_decisions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_decisions_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_commitments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "decisionId" TEXT,
    "agendaItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "reviewedAt" DATETIME,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "estimatedHours" INTEGER,
    "actualHours" INTEGER,
    "completionNotes" TEXT,
    "deliverables" JSONB,
    "actualDeliverables" JSONB,
    "dependsOn" TEXT,
    "blocks" TEXT,
    "requiredResources" JSONB,
    "supportNeeded" TEXT,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "approvedBy" TEXT,
    "riskLevel" TEXT,
    "riskMitigation" TEXT,
    "updates" TEXT,
    "lastUpdateAt" DATETIME,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "escalatedTo" TEXT,
    "escalatedAt" DATETIME,
    "escalationReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_commitments_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_commitments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_commitments_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_commitments_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "meeting_decisions" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_commitments_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_commitments_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commitment_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commitmentId" TEXT NOT NULL,
    "updateType" TEXT NOT NULL,
    "previousStatus" TEXT,
    "newStatus" TEXT,
    "progressChange" INTEGER,
    "notes" TEXT,
    "attachments" JSONB,
    "hoursSpent" INTEGER,
    "remainingHours" INTEGER,
    "issues" TEXT,
    "blockers" TEXT,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "commitment_progress_commitmentId_fkey" FOREIGN KEY ("commitmentId") REFERENCES "meeting_commitments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "commitment_progress_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "agendaItemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileHash" TEXT,
    "documentType" TEXT NOT NULL DEFAULT 'MEETING_DOCUMENT',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'PARTICIPANTS',
    "shareBeforeMeeting" BOOLEAN NOT NULL DEFAULT false,
    "shareAfterMeeting" BOOLEAN NOT NULL DEFAULT true,
    "distributionList" JSONB,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "parentId" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" DATETIME,
    "tags" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "meeting_documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_documents_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_documents_agendaItemId_fkey" FOREIGN KEY ("agendaItemId") REFERENCES "meeting_agenda_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "voting_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "agendaItemId" TEXT,
    "decisionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "votingMethod" TEXT NOT NULL,
    "quorumRequired" INTEGER NOT NULL DEFAULT 1,
    "majorityRequired" INTEGER,
    "timeLimit" INTEGER,
    "allowAbstention" BOOLEAN NOT NULL DEFAULT true,
    "anonymousVoting" BOOLEAN NOT NULL DEFAULT false,
    "proxyVotingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "extendedUntil" DATETIME,
    "totalVotes" INTEGER NOT NULL DEFAULT 0,
    "forVotes" INTEGER NOT NULL DEFAULT 0,
    "againstVotes" INTEGER NOT NULL DEFAULT 0,
    "abstainVotes" INTEGER NOT NULL DEFAULT 0,
    "invalidVotes" INTEGER NOT NULL DEFAULT 0,
    "result" TEXT,
    "resultDetails" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "voting_sessions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "voting_sessions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "voting_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "votingSessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "userId" TEXT,
    "voteType" TEXT NOT NULL,
    "vote" TEXT,
    "justification" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isProxy" BOOLEAN NOT NULL DEFAULT false,
    "proxyFor" TEXT,
    "proxyReason" TEXT,
    "votedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedAt" DATETIME,
    "modifiedBy" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "validationErrors" JSONB,
    CONSTRAINT "voting_records_votingSessionId_fkey" FOREIGN KEY ("votingSessionId") REFERENCES "voting_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "voting_records_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "meeting_participants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "voting_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "voting_records_modifiedBy_fkey" FOREIGN KEY ("modifiedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_minutes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "keyDecisions" JSONB,
    "actionItems" JSONB,
    "attendees" JSONB,
    "absentees" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "draftBy" TEXT NOT NULL,
    "draftedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "publishedAt" DATETIME,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentVersionId" TEXT,
    "changeLog" TEXT,
    "openingRemarks" TEXT,
    "agendaSummary" JSONB,
    "discussions" JSONB,
    "decisions" JSONB,
    "commitments" JSONB,
    "nextSteps" TEXT,
    "template" TEXT,
    "formatting" JSONB,
    "language" TEXT NOT NULL DEFAULT 'es',
    "distributionList" JSONB,
    "internalOnly" BOOLEAN NOT NULL DEFAULT false,
    "publicAccess" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "references" JSONB,
    "tags" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_minutes_draftBy_fkey" FOREIGN KEY ("draftBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_minutes_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_minutes_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_minutes_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "meeting_minutes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "structure" JSONB,
    "placeholders" JSONB,
    "variables" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "requiredRole" TEXT,
    "departmentId" TEXT,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "tags" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_templates_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_templates_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "channels" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "importance" TEXT NOT NULL DEFAULT 'NORMAL',
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "respondedAt" DATETIME,
    "response" TEXT,
    "reminderType" TEXT,
    "reminderOffset" INTEGER,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "calendarInviteSent" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" DATETIME,
    "metadata" JSONB,
    "correlationId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_notifications_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meeting_notifications_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "metricType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" REAL NOT NULL,
    "metricUnit" TEXT,
    "targetValue" REAL,
    "category" TEXT,
    "description" TEXT,
    "factors" JSONB,
    "insights" TEXT,
    "previousValue" REAL,
    "changePercentage" REAL,
    "trend" TEXT,
    "score" REAL,
    "grade" TEXT,
    "rating" TEXT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "reportingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSource" TEXT,
    "confidence" REAL,
    "recommendations" JSONB,
    "actionItems" JSONB,
    "tags" TEXT,
    "metadata" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_analytics_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_analytics_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_conflicts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingId" TEXT NOT NULL,
    "conflictType" TEXT NOT NULL,
    "conflictWith" TEXT,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "resolutionNotes" TEXT,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detectedBy" TEXT,
    "autoResolved" BOOLEAN NOT NULL DEFAULT false,
    "autoResolution" JSONB,
    "impactedParticipants" JSONB,
    "impactAssessment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "meeting_conflicts_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_conflicts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "meeting_conflicts_detectedBy_fkey" FOREIGN KEY ("detectedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "entityType" TEXT,
    "entityId" TEXT,
    "channels" JSONB,
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "sendSms" BOOLEAN NOT NULL DEFAULT false,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "sendPush" BOOLEAN NOT NULL DEFAULT false,
    "pushSent" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" DATETIME,
    "expiresAt" DATETIME,
    "metadata" JSONB,
    "templateId" TEXT,
    "variables" JSONB,
    "clickedAt" DATETIME,
    "respondedAt" DATETIME,
    "response" TEXT,
    "batchId" TEXT,
    "batchIndex" INTEGER,
    "reminderCount" INTEGER NOT NULL DEFAULT 0,
    "maxReminders" INTEGER NOT NULL DEFAULT 3,
    "nextReminderAt" DATETIME,
    "correlationId" TEXT,
    "source" TEXT,
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "notification_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "htmlContent" TEXT,
    "variables" JSONB,
    "placeholders" JSONB,
    "defaultChannels" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "language" TEXT NOT NULL DEFAULT 'es',
    "translations" JSONB,
    "requiredRole" TEXT,
    "departmentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notification_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notification_templates_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableSmsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enablePushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableInAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "quietHoursStart" TEXT,
    "quietHoursEnd" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'America/Santo_Domingo',
    "dailyDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "weeklyDigestEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxNotificationsPerHour" INTEGER NOT NULL DEFAULT 50,
    "maxNotificationsPerDay" INTEGER NOT NULL DEFAULT 200,
    "typePreferences" JSONB,
    "channelPreferences" JSONB,
    "departmentPreferences" JSONB,
    "priorityPreferences" JSONB,
    "customFilters" JSONB,
    "blockedSenders" JSONB,
    "allowedSenders" JSONB,
    "mobileVibrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mobileSoundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "mobileBadgeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailFormatting" TEXT NOT NULL DEFAULT 'both',
    "emailSignatureEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT,
    "eventData" JSONB,
    "errorData" JSONB,
    "eventAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "source" TEXT,
    "channel" TEXT,
    "provider" TEXT,
    "externalId" TEXT,
    "metadata" JSONB,
    "correlationId" TEXT,
    CONSTRAINT "notification_histories_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "provider" TEXT,
    "recipient" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" DATETIME,
    "sentAt" DATETIME,
    "deliveredAt" DATETIME,
    "failedAt" DATETIME,
    "response" JSONB,
    "error" JSONB,
    "messageId" TEXT,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "respondedAt" DATETIME,
    "cost" REAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "retryAfter" DATETIME,
    "retryStrategy" TEXT,
    "metadata" JSONB,
    "correlationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notification_deliveries_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "to" TEXT NOT NULL,
    "cc" TEXT,
    "bcc" TEXT,
    "subject" TEXT NOT NULL,
    "textContent" TEXT,
    "htmlContent" TEXT,
    "fromName" TEXT,
    "fromEmail" TEXT,
    "replyTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" DATETIME,
    "failedAt" DATETIME,
    "provider" TEXT,
    "templateId" TEXT,
    "messageId" TEXT,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "bouncedAt" DATETIME,
    "bouncedReason" TEXT,
    "unsubscribedAt" DATETIME,
    "error" JSONB,
    "retryAfter" DATETIME,
    "metadata" JSONB,
    "correlationId" TEXT,
    "batchId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "websocket_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "serverId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "geolocation" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnectedAt" DATETIME,
    "subscriptions" JSONB,
    "userRooms" JSONB,
    "departmentRooms" JSONB,
    "messagesSent" INTEGER NOT NULL DEFAULT 0,
    "messagesReceived" INTEGER NOT NULL DEFAULT 0,
    "bytesTransferred" BIGINT NOT NULL DEFAULT 0,
    "latency" INTEGER,
    "quality" TEXT,
    "authToken" TEXT,
    "sessionToken" TEXT,
    "metadata" JSONB,
    "deviceInfo" JSONB,
    CONSTRAINT "websocket_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dhKey" TEXT NOT NULL,
    "authKey" TEXT NOT NULL,
    "userAgent" TEXT,
    "deviceType" TEXT,
    "platform" TEXT,
    "appVersion" TEXT,
    "bundleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" DATETIME,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "vapidKey" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reminder_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "templateId" TEXT,
    "subject" TEXT,
    "message" TEXT,
    "recipients" JSONB NOT NULL,
    "channels" JSONB NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "maxReminders" INTEGER NOT NULL DEFAULT 3,
    "reminderInterval" INTEGER NOT NULL DEFAULT 24,
    "metadata" JSONB,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reminder_configs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "notification_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reminder_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "executedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "entityId" TEXT,
    "entityType" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "nextRetryAt" DATETIME,
    "metadata" JSONB,
    "correlationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reminder_jobs_configId_fkey" FOREIGN KEY ("configId") REFERENCES "reminder_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileHash" TEXT,
    "changeSummary" TEXT,
    "isMajorVersion" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "diffData" JSONB,
    "checksum" TEXT,
    "compressedSize" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    "previousVersionId" TEXT,
    CONSTRAINT "document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "document_versions_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "document_versions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_category_refs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "allowedTypes" JSONB,
    "defaultSecurity" TEXT NOT NULL DEFAULT 'INTERNAL',
    "retentionPeriod" INTEGER,
    "autoArchiveRules" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_category_refs_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_category_refs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'ADMINISTRATIVE',
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "placeholders" JSONB,
    "layout" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "securityLevel" TEXT NOT NULL DEFAULT 'INTERNAL',
    "allowedRoles" JSONB,
    "requiredFields" JSONB,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_template_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changeLog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "document_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_template_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "roleId" TEXT,
    "departmentId" TEXT,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canDownload" BOOLEAN NOT NULL DEFAULT false,
    "canShare" BOOLEAN NOT NULL DEFAULT false,
    "canSign" BOOLEAN NOT NULL DEFAULT false,
    "canApprove" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" DATETIME,
    "grantedBy" TEXT,
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_permissions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "document_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "document_permissions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "previousValue" TEXT,
    "newValue" TEXT,
    "changeReason" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "fileSize" INTEGER,
    "fileName" TEXT,
    "filePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_histories_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_tags_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB,
    "duration" INTEGER,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "geolocation" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_actions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_actions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_shares" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "shareType" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "password" TEXT,
    "maxViews" INTEGER,
    "currentViews" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "sharedBy" TEXT NOT NULL,
    "sharedWith" TEXT,
    "message" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessed" DATETIME,
    CONSTRAINT "document_shares_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_shares_sharedBy_fkey" FOREIGN KEY ("sharedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "workflowType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "steps" JSONB NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "initiatedBy" TEXT NOT NULL,
    "initiatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "formData" JSONB,
    "decisions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_workflows_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_workflows_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "document_workflows_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_workflow_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignees" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "assignedAt" DATETIME,
    "completedBy" TEXT,
    "completedAt" DATETIME,
    "decision" TEXT,
    "comments" TEXT,
    "attachments" JSONB,
    "dueDate" DATETIME,
    "completedIn" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "document_workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" DATETIME,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "page" INTEGER,
    "position" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "document_comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "document_comments_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "document_comments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "document_comments_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "department_stage_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "departmentId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    CONSTRAINT "department_stage_assignments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "department_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "departmentId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "isGranted" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "expiresAt" DATETIME,
    CONSTRAINT "department_permissions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "department_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "department_transfers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sourceDepartmentId" TEXT NOT NULL,
    "destinationDepartmentId" TEXT NOT NULL,
    "transferType" TEXT NOT NULL,
    "reason" TEXT,
    "effectiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledFor" DATETIME,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "department_transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "department_transfers_sourceDepartmentId_fkey" FOREIGN KEY ("sourceDepartmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "department_transfers_destinationDepartmentId_fkey" FOREIGN KEY ("destinationDepartmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "responsibleDepartment" TEXT NOT NULL,
    "estimatedDuration" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiredDocuments" JSONB,
    "validationRules" JSONB,
    "autoAssignmentRules" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "case_stage_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "dueDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    CONSTRAINT "case_stage_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "case_stage_assignments_stage_fkey" FOREIGN KEY ("stage") REFERENCES "stages" ("stage") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stage_progressions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "fromStage" TEXT,
    "toStage" TEXT NOT NULL,
    "progressionType" TEXT NOT NULL,
    "reason" TEXT,
    "observations" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "duration" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stage_progressions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stage_progressions_fromStage_fkey" FOREIGN KEY ("fromStage") REFERENCES "stages" ("stage") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stage_progressions_toStage_fkey" FOREIGN KEY ("toStage") REFERENCES "stages" ("stage") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stage_checklists" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "itemType" TEXT NOT NULL,
    "sequence" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stage_checklists_stage_fkey" FOREIGN KEY ("stage") REFERENCES "stages" ("stage") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseStageId" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "notes" TEXT,
    "attachmentPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "checklist_completions_caseStageId_fkey" FOREIGN KEY ("caseStageId") REFERENCES "case_stage_assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "checklist_completions_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "stage_checklists" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stage_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "sendEmail" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stage_notifications_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "stage_notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stage" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "defaultItems" JSONB,
    "autoGenerate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "sequence" INTEGER NOT NULL,
    "estimatedTime" INTEGER,
    "validationRule" TEXT,
    "attachmentRequired" BOOLEAN NOT NULL DEFAULT false,
    "attachmentTypes" JSONB,
    "dependencies" JSONB,
    "autoValidate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "checklist_items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "checklist_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "checklist_item_completions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseStageId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "notes" TEXT,
    "attachmentPath" TEXT,
    "validationResult" JSONB,
    "validationErrors" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "checklist_item_completions_caseStageId_fkey" FOREIGN KEY ("caseStageId") REFERENCES "case_stage_assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "checklist_item_completions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "checklist_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "digital_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "signatureType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "signatureData" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" JSONB,
    "geolocation" JSONB,
    "biometricData" JSONB,
    "delegatedBy" TEXT,
    "delegationReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" DATETIME,
    "revokedBy" TEXT,
    "revokedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "digital_signatures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "digital_signatures_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "approval_workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "workflowType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "requiredApprovals" INTEGER NOT NULL DEFAULT 1,
    "approvalMatrix" JSONB,
    "autoApproveRules" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "initiatedBy" TEXT NOT NULL,
    "initiatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "dueDate" DATETIME,
    "escalatedAt" DATETIME,
    "escalatedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "approval_workflows_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "approval_workflows_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "approval_workflows_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approvalLevel" INTEGER NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "conditions" JSONB,
    "delegationTo" TEXT,
    "reviewedAt" DATETIME,
    "responseTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "approvals_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "approval_workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "approvals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "time_tracking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "duration" INTEGER,
    "pausedDuration" INTEGER,
    "reason" TEXT,
    "justification" TEXT,
    "userId" TEXT NOT NULL,
    "alertThreshold" INTEGER,
    "alertSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "time_tracking_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "time_tracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "review_assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "instructions" TEXT,
    "dueDate" DATETIME,
    "estimatedTime" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "parallelWith" JSONB,
    "dependsOn" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "review_assignments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "review_assignments_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "review_assignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "recommendations" TEXT,
    "conclusion" TEXT NOT NULL,
    "rating" INTEGER,
    "decision" TEXT NOT NULL,
    "evidence" JSONB,
    "attachments" JSONB,
    "reviewTime" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "review_assignments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "observations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "observedBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "deadline" DATETIME,
    "resolvedAt" DATETIME,
    "parentObservationId" TEXT,
    "responseTo" TEXT,
    "tags" TEXT,
    "attachments" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "observations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "observations_observedBy_fkey" FOREIGN KEY ("observedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "observations_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "observations_parentObservationId_fkey" FOREIGN KEY ("parentObservationId") REFERENCES "observations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "observation_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "observationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "attachments" JSONB,
    "responseTime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "observation_responses_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "observations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "observation_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "validation_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "stage" TEXT,
    "expression" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'ERROR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "dependsOn" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "validation_executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ruleId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "stage" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "context" JSONB,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "errors" JSONB,
    "warnings" JSONB,
    "executedBy" TEXT,
    "executedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "validation_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "validation_rules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "validation_executions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "stage" TEXT,
    "riskFactors" JSONB NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskScore" REAL NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "urgency" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "mitigation" TEXT,
    "contingency" TEXT,
    "assessedBy" TEXT NOT NULL,
    "assessmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" DATETIME,
    "recommendations" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "risk_assessments_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "risk_assessments_assessedBy_fkey" FOREIGN KEY ("assessedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "riskAssessmentId" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "acknowledgedAt" DATETIME,
    "acknowledgedBy" TEXT,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    "sendEmail" BOOLEAN NOT NULL DEFAULT true,
    "sendSMS" BOOLEAN NOT NULL DEFAULT false,
    "recipients" JSONB,
    "triggerConditions" JSONB,
    "escalationRules" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "risk_alerts_riskAssessmentId_fkey" FOREIGN KEY ("riskAssessmentId") REFERENCES "risk_assessments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "risk_alerts_acknowledgedBy_fkey" FOREIGN KEY ("acknowledgedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "risk_alerts_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "environment" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "validation" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "previousValue" JSONB,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "effectiveAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    CONSTRAINT "system_configurations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "system_configurations_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "system_configurations_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_configuration_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configurationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "changeReason" TEXT,
    "changedBy" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_configuration_history_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "system_configurations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "system_configuration_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "metadata" JSONB,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "approvedBy" TEXT,
    "reviewedAt" DATETIME,
    "approvedAt" DATETIME,
    "rejectionReason" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "system_templates_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "system_templates_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "system_templates_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "system_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "system_templates_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_template_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "metadata" JSONB,
    "changelog" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_template_versions_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "system_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "system_template_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_template_tests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "testData" JSONB NOT NULL,
    "expectedResult" TEXT,
    "actualResult" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "testRunBy" TEXT NOT NULL,
    "testRunAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_template_tests_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "system_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "system_template_tests_testRunBy_fkey" FOREIGN KEY ("testRunBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "backup_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "compression" BOOLEAN NOT NULL DEFAULT true,
    "encryption" BOOLEAN NOT NULL DEFAULT false,
    "encryptionKey" TEXT,
    "storageType" TEXT NOT NULL,
    "storageConfig" JSONB NOT NULL,
    "storagePath" TEXT,
    "includeTables" JSONB,
    "excludeTables" JSONB,
    "includeFiles" BOOLEAN NOT NULL DEFAULT true,
    "filePaths" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxBackupSize" INTEGER,
    "verifyIntegrity" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnSuccess" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmail" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastRunAt" DATETIME,
    "nextRunAt" DATETIME,
    CONSTRAINT "backup_configurations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "backup_configurations_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "backup_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configurationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "backupSize" INTEGER,
    "compressedSize" INTEGER,
    "filePath" TEXT,
    "checksum" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "recordsBackedUp" INTEGER,
    "filesBackedUp" INTEGER,
    "errorMessage" TEXT,
    "logs" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "backup_jobs_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "backup_configurations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "backup_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "restoration_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "backupJobId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" REAL NOT NULL DEFAULT 0,
    "restoreTables" JSONB,
    "restoreFiles" JSONB,
    "targetLocation" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "recordsRestored" INTEGER,
    "filesRestored" INTEGER,
    "errorMessage" TEXT,
    "logs" TEXT,
    "verificationStatus" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "restoration_jobs_backupJobId_fkey" FOREIGN KEY ("backupJobId") REFERENCES "backup_jobs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "restoration_jobs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "restoration_jobs_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "source" TEXT,
    "userId" TEXT,
    "sessionId" TEXT,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "duration" INTEGER,
    "memoryUsage" INTEGER,
    "cpuUsage" REAL,
    "stackTrace" TEXT,
    "tags" JSONB,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "system_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "source" TEXT,
    "tags" JSONB,
    "warningThreshold" REAL,
    "criticalThreshold" REAL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "holiday_calendars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'DO',
    "region" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "holiday_calendars_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "holiday_calendars_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "calendarId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "affectsWork" BOOLEAN NOT NULL DEFAULT true,
    "workCompensation" TEXT,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "holidays_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "holiday_calendars" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "holidays_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stage_time_configurations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stage" TEXT NOT NULL,
    "maxTimeHours" INTEGER NOT NULL,
    "warningThresholdHours" INTEGER,
    "criticalThresholdHours" INTEGER,
    "businessDaysOnly" BOOLEAN NOT NULL DEFAULT true,
    "workHours" JSONB,
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "effectiveFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" DATETIME,
    CONSTRAINT "stage_time_configurations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "stage_time_configurations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stage_time_configurations_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "security_policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "configuration" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "enforcementLevel" TEXT NOT NULL DEFAULT 'warn',
    "complianceStandard" TEXT,
    "lastAuditedAt" DATETIME,
    "auditResults" JSONB,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "security_policies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "security_policies_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usage_statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "metric" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "departmentId" TEXT,
    "userId" TEXT,
    "role" TEXT,
    "dimensions" JSONB,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usage_statistics_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "usage_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_notification_channels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "configuration" JSONB NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "rateLimitPerHour" INTEGER,
    "rateLimitPerDay" INTEGER,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryDelay" INTEGER NOT NULL DEFAULT 300,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "system_notification_channels_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "system_notification_channels_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_health_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "endpoint" TEXT,
    "method" TEXT,
    "expectedStatus" INTEGER,
    "timeout" INTEGER NOT NULL DEFAULT 30000,
    "responseTime" INTEGER,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "details" JSONB,
    "checkInterval" INTEGER NOT NULL DEFAULT 300,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertOnFailure" BOOLEAN NOT NULL DEFAULT true,
    "alertChannels" JSONB,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastCheckedAt" DATETIME,
    CONSTRAINT "system_health_checks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");

-- CreateIndex
CREATE INDEX "departments_isActive_idx" ON "departments"("isActive");

-- CreateIndex
CREATE INDEX "departments_headUserId_idx" ON "departments"("headUserId");

-- CreateIndex
CREATE INDEX "departments_code_idx" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_departmentId_idx" ON "users"("departmentId");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_isSuspended_idx" ON "users"("isSuspended");

-- CreateIndex
CREATE INDEX "users_lastLoginAt_idx" ON "users"("lastLoginAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "password_histories_userId_idx" ON "password_histories"("userId");

-- CreateIndex
CREATE INDEX "password_histories_changedAt_idx" ON "password_histories"("changedAt");

-- CreateIndex
CREATE INDEX "user_department_assignments_userId_idx" ON "user_department_assignments"("userId");

-- CreateIndex
CREATE INDEX "user_department_assignments_departmentId_idx" ON "user_department_assignments"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "user_department_assignments_userId_departmentId_key" ON "user_department_assignments"("userId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "cases_fileNumber_key" ON "cases"("fileNumber");

-- CreateIndex
CREATE INDEX "cases_fileNumber_idx" ON "cases"("fileNumber");

-- CreateIndex
CREATE INDEX "cases_currentStage_idx" ON "cases"("currentStage");

-- CreateIndex
CREATE INDEX "cases_priority_idx" ON "cases"("priority");

-- CreateIndex
CREATE INDEX "cases_status_idx" ON "cases"("status");

-- CreateIndex
CREATE INDEX "cases_departmentId_idx" ON "cases"("departmentId");

-- CreateIndex
CREATE INDEX "cases_createdById_idx" ON "cases"("createdById");

-- CreateIndex
CREATE INDEX "cases_assignedToId_idx" ON "cases"("assignedToId");

-- CreateIndex
CREATE INDEX "cases_supervisedById_idx" ON "cases"("supervisedById");

-- CreateIndex
CREATE INDEX "cases_createdAt_idx" ON "cases"("createdAt");

-- CreateIndex
CREATE INDEX "cases_startDate_idx" ON "cases"("startDate");

-- CreateIndex
CREATE INDEX "cases_expectedEndDate_idx" ON "cases"("expectedEndDate");

-- CreateIndex
CREATE INDEX "cases_deletedAt_idx" ON "cases"("deletedAt");

-- CreateIndex
CREATE INDEX "cases_ownerName_idx" ON "cases"("ownerName");

-- CreateIndex
CREATE INDEX "cases_propertyAddress_idx" ON "cases"("propertyAddress");

-- CreateIndex
CREATE INDEX "documents_caseId_idx" ON "documents"("caseId");

-- CreateIndex
CREATE INDEX "documents_uploadedById_idx" ON "documents"("uploadedById");

-- CreateIndex
CREATE INDEX "documents_documentType_idx" ON "documents"("documentType");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_securityLevel_idx" ON "documents"("securityLevel");

-- CreateIndex
CREATE INDEX "documents_version_idx" ON "documents"("version");

-- CreateIndex
CREATE INDEX "documents_isLatest_idx" ON "documents"("isLatest");

-- CreateIndex
CREATE INDEX "documents_isPublic_idx" ON "documents"("isPublic");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

-- CreateIndex
CREATE INDEX "documents_expiresAt_idx" ON "documents"("expiresAt");

-- CreateIndex
CREATE INDEX "documents_fileHash_idx" ON "documents"("fileHash");

-- CreateIndex
CREATE INDEX "documents_contentText_idx" ON "documents"("contentText");

-- CreateIndex
CREATE INDEX "case_histories_caseId_idx" ON "case_histories"("caseId");

-- CreateIndex
CREATE INDEX "case_histories_changedById_idx" ON "case_histories"("changedById");

-- CreateIndex
CREATE INDEX "case_histories_action_idx" ON "case_histories"("action");

-- CreateIndex
CREATE INDEX "case_histories_createdAt_idx" ON "case_histories"("createdAt");

-- CreateIndex
CREATE INDEX "activities_userId_idx" ON "activities"("userId");

-- CreateIndex
CREATE INDEX "activities_action_idx" ON "activities"("action");

-- CreateIndex
CREATE INDEX "activities_entityType_idx" ON "activities"("entityType");

-- CreateIndex
CREATE INDEX "activities_entityId_idx" ON "activities"("entityId");

-- CreateIndex
CREATE INDEX "activities_createdAt_idx" ON "activities"("createdAt");

-- CreateIndex
CREATE INDEX "activities_caseId_idx" ON "activities"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "case_assignments_caseId_userId_type_key" ON "case_assignments"("caseId", "userId", "type");

-- CreateIndex
CREATE INDEX "meetings_meetingType_idx" ON "meetings"("meetingType");

-- CreateIndex
CREATE INDEX "meetings_status_idx" ON "meetings"("status");

-- CreateIndex
CREATE INDEX "meetings_priority_idx" ON "meetings"("priority");

-- CreateIndex
CREATE INDEX "meetings_scheduledStart_idx" ON "meetings"("scheduledStart");

-- CreateIndex
CREATE INDEX "meetings_scheduledEnd_idx" ON "meetings"("scheduledEnd");

-- CreateIndex
CREATE INDEX "meetings_organizerId_idx" ON "meetings"("organizerId");

-- CreateIndex
CREATE INDEX "meetings_chairId_idx" ON "meetings"("chairId");

-- CreateIndex
CREATE INDEX "meetings_caseId_idx" ON "meetings"("caseId");

-- CreateIndex
CREATE INDEX "meetings_isRecurring_idx" ON "meetings"("isRecurring");

-- CreateIndex
CREATE INDEX "meetings_parentMeetingId_idx" ON "meetings"("parentMeetingId");

-- CreateIndex
CREATE INDEX "meetings_virtual_idx" ON "meetings"("virtual");

-- CreateIndex
CREATE INDEX "meetings_createdAt_idx" ON "meetings"("createdAt");

-- CreateIndex
CREATE INDEX "meeting_participants_meetingId_idx" ON "meeting_participants"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_participants_userId_idx" ON "meeting_participants"("userId");

-- CreateIndex
CREATE INDEX "meeting_participants_email_idx" ON "meeting_participants"("email");

-- CreateIndex
CREATE INDEX "meeting_participants_rsvpStatus_idx" ON "meeting_participants"("rsvpStatus");

-- CreateIndex
CREATE INDEX "meeting_participants_role_idx" ON "meeting_participants"("role");

-- CreateIndex
CREATE INDEX "meeting_participants_attended_idx" ON "meeting_participants"("attended");

-- CreateIndex
CREATE INDEX "meeting_participants_isExternal_idx" ON "meeting_participants"("isExternal");

-- CreateIndex
CREATE INDEX "meeting_participants_invitedAt_idx" ON "meeting_participants"("invitedAt");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participants_meetingId_userId_key" ON "meeting_participants"("meetingId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_participants_meetingId_email_key" ON "meeting_participants"("meetingId", "email");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_meetingId_idx" ON "meeting_agenda_items"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_type_idx" ON "meeting_agenda_items"("type");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_presenterId_idx" ON "meeting_agenda_items"("presenterId");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_ownerId_idx" ON "meeting_agenda_items"("ownerId");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_status_idx" ON "meeting_agenda_items"("status");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_priority_idx" ON "meeting_agenda_items"("priority");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_requiresVote_idx" ON "meeting_agenda_items"("requiresVote");

-- CreateIndex
CREATE INDEX "meeting_agenda_items_createdAt_idx" ON "meeting_agenda_items"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_agenda_items_meetingId_sequence_key" ON "meeting_agenda_items"("meetingId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_agenda_items_votingSessionId_key" ON "meeting_agenda_items"("votingSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_agenda_items_decisionId_key" ON "meeting_agenda_items"("decisionId");

-- CreateIndex
CREATE INDEX "meeting_decisions_meetingId_idx" ON "meeting_decisions"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_decisions_agendaItemId_idx" ON "meeting_decisions"("agendaItemId");

-- CreateIndex
CREATE INDEX "meeting_decisions_decisionType_idx" ON "meeting_decisions"("decisionType");

-- CreateIndex
CREATE INDEX "meeting_decisions_status_idx" ON "meeting_decisions"("status");

-- CreateIndex
CREATE INDEX "meeting_decisions_priority_idx" ON "meeting_decisions"("priority");

-- CreateIndex
CREATE INDEX "meeting_decisions_proposedBy_idx" ON "meeting_decisions"("proposedBy");

-- CreateIndex
CREATE INDEX "meeting_decisions_approvedAt_idx" ON "meeting_decisions"("approvedAt");

-- CreateIndex
CREATE INDEX "meeting_decisions_effectiveDate_idx" ON "meeting_decisions"("effectiveDate");

-- CreateIndex
CREATE INDEX "meeting_decisions_caseId_idx" ON "meeting_decisions"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_decisions_votingSessionId_key" ON "meeting_decisions"("votingSessionId");

-- CreateIndex
CREATE INDEX "meeting_commitments_meetingId_idx" ON "meeting_commitments"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_commitments_decisionId_idx" ON "meeting_commitments"("decisionId");

-- CreateIndex
CREATE INDEX "meeting_commitments_assignedTo_idx" ON "meeting_commitments"("assignedTo");

-- CreateIndex
CREATE INDEX "meeting_commitments_assignedBy_idx" ON "meeting_commitments"("assignedBy");

-- CreateIndex
CREATE INDEX "meeting_commitments_status_idx" ON "meeting_commitments"("status");

-- CreateIndex
CREATE INDEX "meeting_commitments_priority_idx" ON "meeting_commitments"("priority");

-- CreateIndex
CREATE INDEX "meeting_commitments_dueDate_idx" ON "meeting_commitments"("dueDate");

-- CreateIndex
CREATE INDEX "meeting_commitments_completedAt_idx" ON "meeting_commitments"("completedAt");

-- CreateIndex
CREATE INDEX "meeting_commitments_escalated_idx" ON "meeting_commitments"("escalated");

-- CreateIndex
CREATE INDEX "commitment_progress_commitmentId_idx" ON "commitment_progress"("commitmentId");

-- CreateIndex
CREATE INDEX "commitment_progress_updateType_idx" ON "commitment_progress"("updateType");

-- CreateIndex
CREATE INDEX "commitment_progress_updatedBy_idx" ON "commitment_progress"("updatedBy");

-- CreateIndex
CREATE INDEX "commitment_progress_updatedAt_idx" ON "commitment_progress"("updatedAt");

-- CreateIndex
CREATE INDEX "meeting_documents_meetingId_idx" ON "meeting_documents"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_documents_agendaItemId_idx" ON "meeting_documents"("agendaItemId");

-- CreateIndex
CREATE INDEX "meeting_documents_uploadedBy_idx" ON "meeting_documents"("uploadedBy");

-- CreateIndex
CREATE INDEX "meeting_documents_documentType_idx" ON "meeting_documents"("documentType");

-- CreateIndex
CREATE INDEX "meeting_documents_category_idx" ON "meeting_documents"("category");

-- CreateIndex
CREATE INDEX "meeting_documents_isRequired_idx" ON "meeting_documents"("isRequired");

-- CreateIndex
CREATE INDEX "meeting_documents_uploadedAt_idx" ON "meeting_documents"("uploadedAt");

-- CreateIndex
CREATE INDEX "voting_sessions_meetingId_idx" ON "voting_sessions"("meetingId");

-- CreateIndex
CREATE INDEX "voting_sessions_agendaItemId_idx" ON "voting_sessions"("agendaItemId");

-- CreateIndex
CREATE INDEX "voting_sessions_decisionId_idx" ON "voting_sessions"("decisionId");

-- CreateIndex
CREATE INDEX "voting_sessions_status_idx" ON "voting_sessions"("status");

-- CreateIndex
CREATE INDEX "voting_sessions_createdBy_idx" ON "voting_sessions"("createdBy");

-- CreateIndex
CREATE INDEX "voting_sessions_startedAt_idx" ON "voting_sessions"("startedAt");

-- CreateIndex
CREATE INDEX "voting_sessions_endedAt_idx" ON "voting_sessions"("endedAt");

-- CreateIndex
CREATE INDEX "voting_records_votingSessionId_idx" ON "voting_records"("votingSessionId");

-- CreateIndex
CREATE INDEX "voting_records_participantId_idx" ON "voting_records"("participantId");

-- CreateIndex
CREATE INDEX "voting_records_userId_idx" ON "voting_records"("userId");

-- CreateIndex
CREATE INDEX "voting_records_voteType_idx" ON "voting_records"("voteType");

-- CreateIndex
CREATE INDEX "voting_records_votedAt_idx" ON "voting_records"("votedAt");

-- CreateIndex
CREATE INDEX "voting_records_isValid_idx" ON "voting_records"("isValid");

-- CreateIndex
CREATE UNIQUE INDEX "voting_records_votingSessionId_participantId_key" ON "voting_records"("votingSessionId", "participantId");

-- CreateIndex
CREATE INDEX "meeting_minutes_meetingId_idx" ON "meeting_minutes"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_minutes_status_idx" ON "meeting_minutes"("status");

-- CreateIndex
CREATE INDEX "meeting_minutes_draftBy_idx" ON "meeting_minutes"("draftBy");

-- CreateIndex
CREATE INDEX "meeting_minutes_reviewedBy_idx" ON "meeting_minutes"("reviewedBy");

-- CreateIndex
CREATE INDEX "meeting_minutes_approvedBy_idx" ON "meeting_minutes"("approvedBy");

-- CreateIndex
CREATE INDEX "meeting_minutes_version_idx" ON "meeting_minutes"("version");

-- CreateIndex
CREATE INDEX "meeting_minutes_draftedAt_idx" ON "meeting_minutes"("draftedAt");

-- CreateIndex
CREATE INDEX "meeting_minutes_approvedAt_idx" ON "meeting_minutes"("approvedAt");

-- CreateIndex
CREATE INDEX "meeting_templates_type_idx" ON "meeting_templates"("type");

-- CreateIndex
CREATE INDEX "meeting_templates_category_idx" ON "meeting_templates"("category");

-- CreateIndex
CREATE INDEX "meeting_templates_isActive_idx" ON "meeting_templates"("isActive");

-- CreateIndex
CREATE INDEX "meeting_templates_isDefault_idx" ON "meeting_templates"("isDefault");

-- CreateIndex
CREATE INDEX "meeting_templates_createdBy_idx" ON "meeting_templates"("createdBy");

-- CreateIndex
CREATE INDEX "meeting_templates_departmentId_idx" ON "meeting_templates"("departmentId");

-- CreateIndex
CREATE INDEX "meeting_notifications_meetingId_idx" ON "meeting_notifications"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_notifications_recipientId_idx" ON "meeting_notifications"("recipientId");

-- CreateIndex
CREATE INDEX "meeting_notifications_type_idx" ON "meeting_notifications"("type");

-- CreateIndex
CREATE INDEX "meeting_notifications_deliveryStatus_idx" ON "meeting_notifications"("deliveryStatus");

-- CreateIndex
CREATE INDEX "meeting_notifications_scheduledAt_idx" ON "meeting_notifications"("scheduledAt");

-- CreateIndex
CREATE INDEX "meeting_notifications_sentAt_idx" ON "meeting_notifications"("sentAt");

-- CreateIndex
CREATE INDEX "meeting_notifications_createdBy_idx" ON "meeting_notifications"("createdBy");

-- CreateIndex
CREATE INDEX "meeting_analytics_meetingId_idx" ON "meeting_analytics"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_analytics_metricType_idx" ON "meeting_analytics"("metricType");

-- CreateIndex
CREATE INDEX "meeting_analytics_metricName_idx" ON "meeting_analytics"("metricName");

-- CreateIndex
CREATE INDEX "meeting_analytics_periodStart_idx" ON "meeting_analytics"("periodStart");

-- CreateIndex
CREATE INDEX "meeting_analytics_periodEnd_idx" ON "meeting_analytics"("periodEnd");

-- CreateIndex
CREATE INDEX "meeting_analytics_createdBy_idx" ON "meeting_analytics"("createdBy");

-- CreateIndex
CREATE INDEX "meeting_analytics_reportingDate_idx" ON "meeting_analytics"("reportingDate");

-- CreateIndex
CREATE INDEX "meeting_conflicts_meetingId_idx" ON "meeting_conflicts"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_conflicts_conflictType_idx" ON "meeting_conflicts"("conflictType");

-- CreateIndex
CREATE INDEX "meeting_conflicts_severity_idx" ON "meeting_conflicts"("severity");

-- CreateIndex
CREATE INDEX "meeting_conflicts_resolution_idx" ON "meeting_conflicts"("resolution");

-- CreateIndex
CREATE INDEX "meeting_conflicts_detectedAt_idx" ON "meeting_conflicts"("detectedAt");

-- CreateIndex
CREATE INDEX "meeting_conflicts_resolvedAt_idx" ON "meeting_conflicts"("resolvedAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_scheduledAt_idx" ON "notifications"("scheduledAt");

-- CreateIndex
CREATE INDEX "notifications_expiresAt_idx" ON "notifications"("expiresAt");

-- CreateIndex
CREATE INDEX "notifications_entityType_entityId_idx" ON "notifications"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notifications_batchId_idx" ON "notifications"("batchId");

-- CreateIndex
CREATE INDEX "notifications_correlationId_idx" ON "notifications"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_name_key" ON "notification_templates"("name");

-- CreateIndex
CREATE INDEX "notification_templates_category_idx" ON "notification_templates"("category");

-- CreateIndex
CREATE INDEX "notification_templates_type_idx" ON "notification_templates"("type");

-- CreateIndex
CREATE INDEX "notification_templates_isActive_idx" ON "notification_templates"("isActive");

-- CreateIndex
CREATE INDEX "notification_templates_isDefault_idx" ON "notification_templates"("isDefault");

-- CreateIndex
CREATE INDEX "notification_templates_language_idx" ON "notification_templates"("language");

-- CreateIndex
CREATE INDEX "notification_templates_createdBy_idx" ON "notification_templates"("createdBy");

-- CreateIndex
CREATE INDEX "notification_templates_departmentId_idx" ON "notification_templates"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preferences_userId_key" ON "user_notification_preferences"("userId");

-- CreateIndex
CREATE INDEX "notification_histories_notificationId_idx" ON "notification_histories"("notificationId");

-- CreateIndex
CREATE INDEX "notification_histories_eventType_idx" ON "notification_histories"("eventType");

-- CreateIndex
CREATE INDEX "notification_histories_eventAt_idx" ON "notification_histories"("eventAt");

-- CreateIndex
CREATE INDEX "notification_histories_channel_idx" ON "notification_histories"("channel");

-- CreateIndex
CREATE INDEX "notification_histories_status_idx" ON "notification_histories"("status");

-- CreateIndex
CREATE INDEX "notification_histories_correlationId_idx" ON "notification_histories"("correlationId");

-- CreateIndex
CREATE INDEX "notification_deliveries_notificationId_idx" ON "notification_deliveries"("notificationId");

-- CreateIndex
CREATE INDEX "notification_deliveries_channel_idx" ON "notification_deliveries"("channel");

-- CreateIndex
CREATE INDEX "notification_deliveries_status_idx" ON "notification_deliveries"("status");

-- CreateIndex
CREATE INDEX "notification_deliveries_scheduledAt_idx" ON "notification_deliveries"("scheduledAt");

-- CreateIndex
CREATE INDEX "notification_deliveries_sentAt_idx" ON "notification_deliveries"("sentAt");

-- CreateIndex
CREATE INDEX "notification_deliveries_correlationId_idx" ON "notification_deliveries"("correlationId");

-- CreateIndex
CREATE INDEX "email_queue_status_idx" ON "email_queue"("status");

-- CreateIndex
CREATE INDEX "email_queue_priority_idx" ON "email_queue"("priority");

-- CreateIndex
CREATE INDEX "email_queue_scheduledAt_idx" ON "email_queue"("scheduledAt");

-- CreateIndex
CREATE INDEX "email_queue_sentAt_idx" ON "email_queue"("sentAt");

-- CreateIndex
CREATE INDEX "email_queue_batchId_idx" ON "email_queue"("batchId");

-- CreateIndex
CREATE INDEX "email_queue_correlationId_idx" ON "email_queue"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "websocket_connections_socketId_key" ON "websocket_connections"("socketId");

-- CreateIndex
CREATE UNIQUE INDEX "websocket_connections_connectionId_key" ON "websocket_connections"("connectionId");

-- CreateIndex
CREATE INDEX "websocket_connections_userId_idx" ON "websocket_connections"("userId");

-- CreateIndex
CREATE INDEX "websocket_connections_socketId_idx" ON "websocket_connections"("socketId");

-- CreateIndex
CREATE INDEX "websocket_connections_connectionId_idx" ON "websocket_connections"("connectionId");

-- CreateIndex
CREATE INDEX "websocket_connections_status_idx" ON "websocket_connections"("status");

-- CreateIndex
CREATE INDEX "websocket_connections_lastActivity_idx" ON "websocket_connections"("lastActivity");

-- CreateIndex
CREATE INDEX "websocket_connections_connectedAt_idx" ON "websocket_connections"("connectedAt");

-- CreateIndex
CREATE INDEX "websocket_connections_serverId_idx" ON "websocket_connections"("serverId");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "push_subscriptions_isActive_idx" ON "push_subscriptions"("isActive");

-- CreateIndex
CREATE INDEX "push_subscriptions_deviceType_idx" ON "push_subscriptions"("deviceType");

-- CreateIndex
CREATE INDEX "push_subscriptions_platform_idx" ON "push_subscriptions"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "reminder_configs_type_idx" ON "reminder_configs"("type");

-- CreateIndex
CREATE INDEX "reminder_configs_isActive_idx" ON "reminder_configs"("isActive");

-- CreateIndex
CREATE INDEX "reminder_configs_schedule_idx" ON "reminder_configs"("schedule");

-- CreateIndex
CREATE INDEX "reminder_configs_createdAt_idx" ON "reminder_configs"("createdAt");

-- CreateIndex
CREATE INDEX "reminder_jobs_configId_idx" ON "reminder_jobs"("configId");

-- CreateIndex
CREATE INDEX "reminder_jobs_status_idx" ON "reminder_jobs"("status");

-- CreateIndex
CREATE INDEX "reminder_jobs_scheduledAt_idx" ON "reminder_jobs"("scheduledAt");

-- CreateIndex
CREATE INDEX "reminder_jobs_executedAt_idx" ON "reminder_jobs"("executedAt");

-- CreateIndex
CREATE INDEX "reminder_jobs_entityType_entityId_idx" ON "reminder_jobs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "reminder_jobs_correlationId_idx" ON "reminder_jobs"("correlationId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "document_versions_documentId_idx" ON "document_versions"("documentId");

-- CreateIndex
CREATE INDEX "document_versions_version_idx" ON "document_versions"("version");

-- CreateIndex
CREATE INDEX "document_versions_isActive_idx" ON "document_versions"("isActive");

-- CreateIndex
CREATE INDEX "document_versions_isPublished_idx" ON "document_versions"("isPublished");

-- CreateIndex
CREATE INDEX "document_versions_createdBy_idx" ON "document_versions"("createdBy");

-- CreateIndex
CREATE INDEX "document_versions_createdAt_idx" ON "document_versions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_documentId_version_key" ON "document_versions"("documentId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "document_category_refs_name_key" ON "document_category_refs"("name");

-- CreateIndex
CREATE INDEX "document_category_refs_category_idx" ON "document_category_refs"("category");

-- CreateIndex
CREATE INDEX "document_category_refs_isActive_idx" ON "document_category_refs"("isActive");

-- CreateIndex
CREATE INDEX "document_category_refs_parentId_idx" ON "document_category_refs"("parentId");

-- CreateIndex
CREATE INDEX "document_templates_templateType_idx" ON "document_templates"("templateType");

-- CreateIndex
CREATE INDEX "document_templates_category_idx" ON "document_templates"("category");

-- CreateIndex
CREATE INDEX "document_templates_isActive_idx" ON "document_templates"("isActive");

-- CreateIndex
CREATE INDEX "document_templates_isDefault_idx" ON "document_templates"("isDefault");

-- CreateIndex
CREATE INDEX "document_templates_createdBy_idx" ON "document_templates"("createdBy");

-- CreateIndex
CREATE INDEX "document_template_versions_templateId_idx" ON "document_template_versions"("templateId");

-- CreateIndex
CREATE INDEX "document_template_versions_version_idx" ON "document_template_versions"("version");

-- CreateIndex
CREATE UNIQUE INDEX "document_template_versions_templateId_version_key" ON "document_template_versions"("templateId", "version");

-- CreateIndex
CREATE INDEX "document_permissions_documentId_idx" ON "document_permissions"("documentId");

-- CreateIndex
CREATE INDEX "document_permissions_userId_idx" ON "document_permissions"("userId");

-- CreateIndex
CREATE INDEX "document_permissions_roleId_idx" ON "document_permissions"("roleId");

-- CreateIndex
CREATE INDEX "document_permissions_departmentId_idx" ON "document_permissions"("departmentId");

-- CreateIndex
CREATE INDEX "document_permissions_isActive_idx" ON "document_permissions"("isActive");

-- CreateIndex
CREATE INDEX "document_permissions_expiresAt_idx" ON "document_permissions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_permissions_documentId_userId_roleId_departmentId_key" ON "document_permissions"("documentId", "userId", "roleId", "departmentId");

-- CreateIndex
CREATE INDEX "document_histories_documentId_idx" ON "document_histories"("documentId");

-- CreateIndex
CREATE INDEX "document_histories_action_idx" ON "document_histories"("action");

-- CreateIndex
CREATE INDEX "document_histories_userId_idx" ON "document_histories"("userId");

-- CreateIndex
CREATE INDEX "document_histories_createdAt_idx" ON "document_histories"("createdAt");

-- CreateIndex
CREATE INDEX "document_histories_field_idx" ON "document_histories"("field");

-- CreateIndex
CREATE INDEX "document_tags_documentId_idx" ON "document_tags"("documentId");

-- CreateIndex
CREATE INDEX "document_tags_tag_idx" ON "document_tags"("tag");

-- CreateIndex
CREATE INDEX "document_tags_isActive_idx" ON "document_tags"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "document_tags_documentId_tag_key" ON "document_tags"("documentId", "tag");

-- CreateIndex
CREATE INDEX "document_actions_documentId_idx" ON "document_actions"("documentId");

-- CreateIndex
CREATE INDEX "document_actions_action_idx" ON "document_actions"("action");

-- CreateIndex
CREATE INDEX "document_actions_userId_idx" ON "document_actions"("userId");

-- CreateIndex
CREATE INDEX "document_actions_createdAt_idx" ON "document_actions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_shares_shareToken_key" ON "document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_documentId_idx" ON "document_shares"("documentId");

-- CreateIndex
CREATE INDEX "document_shares_shareToken_idx" ON "document_shares"("shareToken");

-- CreateIndex
CREATE INDEX "document_shares_sharedBy_idx" ON "document_shares"("sharedBy");

-- CreateIndex
CREATE INDEX "document_shares_expiresAt_idx" ON "document_shares"("expiresAt");

-- CreateIndex
CREATE INDEX "document_shares_isActive_idx" ON "document_shares"("isActive");

-- CreateIndex
CREATE INDEX "document_workflows_documentId_idx" ON "document_workflows"("documentId");

-- CreateIndex
CREATE INDEX "document_workflows_workflowType_idx" ON "document_workflows"("workflowType");

-- CreateIndex
CREATE INDEX "document_workflows_status_idx" ON "document_workflows"("status");

-- CreateIndex
CREATE INDEX "document_workflows_initiatedBy_idx" ON "document_workflows"("initiatedBy");

-- CreateIndex
CREATE INDEX "document_workflows_createdAt_idx" ON "document_workflows"("createdAt");

-- CreateIndex
CREATE INDEX "document_workflow_steps_workflowId_idx" ON "document_workflow_steps"("workflowId");

-- CreateIndex
CREATE INDEX "document_workflow_steps_stepOrder_idx" ON "document_workflow_steps"("stepOrder");

-- CreateIndex
CREATE INDEX "document_workflow_steps_status_idx" ON "document_workflow_steps"("status");

-- CreateIndex
CREATE INDEX "document_workflow_steps_assignedTo_idx" ON "document_workflow_steps"("assignedTo");

-- CreateIndex
CREATE INDEX "document_workflow_steps_dueDate_idx" ON "document_workflow_steps"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "document_workflow_steps_workflowId_stepOrder_key" ON "document_workflow_steps"("workflowId", "stepOrder");

-- CreateIndex
CREATE INDEX "document_comments_documentId_idx" ON "document_comments"("documentId");

-- CreateIndex
CREATE INDEX "document_comments_parentId_idx" ON "document_comments"("parentId");

-- CreateIndex
CREATE INDEX "document_comments_createdBy_idx" ON "document_comments"("createdBy");

-- CreateIndex
CREATE INDEX "document_comments_isResolved_idx" ON "document_comments"("isResolved");

-- CreateIndex
CREATE INDEX "document_comments_createdAt_idx" ON "document_comments"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "department_stage_assignments_departmentId_idx" ON "department_stage_assignments"("departmentId");

-- CreateIndex
CREATE INDEX "department_stage_assignments_stage_idx" ON "department_stage_assignments"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "department_stage_assignments_departmentId_stage_key" ON "department_stage_assignments"("departmentId", "stage");

-- CreateIndex
CREATE INDEX "department_permissions_departmentId_idx" ON "department_permissions"("departmentId");

-- CreateIndex
CREATE INDEX "department_permissions_permissionId_idx" ON "department_permissions"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "department_permissions_departmentId_permissionId_key" ON "department_permissions"("departmentId", "permissionId");

-- CreateIndex
CREATE INDEX "department_transfers_userId_idx" ON "department_transfers"("userId");

-- CreateIndex
CREATE INDEX "department_transfers_sourceDepartmentId_idx" ON "department_transfers"("sourceDepartmentId");

-- CreateIndex
CREATE INDEX "department_transfers_destinationDepartmentId_idx" ON "department_transfers"("destinationDepartmentId");

-- CreateIndex
CREATE INDEX "department_transfers_status_idx" ON "department_transfers"("status");

-- CreateIndex
CREATE INDEX "department_transfers_effectiveDate_idx" ON "department_transfers"("effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "stages_stage_key" ON "stages"("stage");

-- CreateIndex
CREATE INDEX "stages_sequenceOrder_idx" ON "stages"("sequenceOrder");

-- CreateIndex
CREATE INDEX "stages_responsibleDepartment_idx" ON "stages"("responsibleDepartment");

-- CreateIndex
CREATE INDEX "stages_isActive_idx" ON "stages"("isActive");

-- CreateIndex
CREATE INDEX "case_stage_assignments_caseId_idx" ON "case_stage_assignments"("caseId");

-- CreateIndex
CREATE INDEX "case_stage_assignments_stage_idx" ON "case_stage_assignments"("stage");

-- CreateIndex
CREATE INDEX "case_stage_assignments_assignedBy_idx" ON "case_stage_assignments"("assignedBy");

-- CreateIndex
CREATE INDEX "case_stage_assignments_dueDate_idx" ON "case_stage_assignments"("dueDate");

-- CreateIndex
CREATE INDEX "case_stage_assignments_isActive_idx" ON "case_stage_assignments"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "case_stage_assignments_caseId_stage_key" ON "case_stage_assignments"("caseId", "stage");

-- CreateIndex
CREATE INDEX "stage_progressions_caseId_idx" ON "stage_progressions"("caseId");

-- CreateIndex
CREATE INDEX "stage_progressions_fromStage_idx" ON "stage_progressions"("fromStage");

-- CreateIndex
CREATE INDEX "stage_progressions_toStage_idx" ON "stage_progressions"("toStage");

-- CreateIndex
CREATE INDEX "stage_progressions_progressionType_idx" ON "stage_progressions"("progressionType");

-- CreateIndex
CREATE INDEX "stage_progressions_approvedBy_idx" ON "stage_progressions"("approvedBy");

-- CreateIndex
CREATE INDEX "stage_progressions_createdAt_idx" ON "stage_progressions"("createdAt");

-- CreateIndex
CREATE INDEX "stage_checklists_stage_idx" ON "stage_checklists"("stage");

-- CreateIndex
CREATE INDEX "stage_checklists_isRequired_idx" ON "stage_checklists"("isRequired");

-- CreateIndex
CREATE INDEX "stage_checklists_isActive_idx" ON "stage_checklists"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "stage_checklists_stage_sequence_key" ON "stage_checklists"("stage", "sequence");

-- CreateIndex
CREATE INDEX "checklist_completions_caseStageId_idx" ON "checklist_completions"("caseStageId");

-- CreateIndex
CREATE INDEX "checklist_completions_checklistId_idx" ON "checklist_completions"("checklistId");

-- CreateIndex
CREATE INDEX "checklist_completions_isCompleted_idx" ON "checklist_completions"("isCompleted");

-- CreateIndex
CREATE INDEX "checklist_completions_completedBy_idx" ON "checklist_completions"("completedBy");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_completions_caseStageId_checklistId_key" ON "checklist_completions"("caseStageId", "checklistId");

-- CreateIndex
CREATE INDEX "stage_notifications_caseId_idx" ON "stage_notifications"("caseId");

-- CreateIndex
CREATE INDEX "stage_notifications_stage_idx" ON "stage_notifications"("stage");

-- CreateIndex
CREATE INDEX "stage_notifications_recipientId_idx" ON "stage_notifications"("recipientId");

-- CreateIndex
CREATE INDEX "stage_notifications_type_idx" ON "stage_notifications"("type");

-- CreateIndex
CREATE INDEX "stage_notifications_isRead_idx" ON "stage_notifications"("isRead");

-- CreateIndex
CREATE INDEX "stage_notifications_priority_idx" ON "stage_notifications"("priority");

-- CreateIndex
CREATE INDEX "stage_notifications_createdAt_idx" ON "stage_notifications"("createdAt");

-- CreateIndex
CREATE INDEX "checklist_templates_stage_idx" ON "checklist_templates"("stage");

-- CreateIndex
CREATE INDEX "checklist_templates_isActive_idx" ON "checklist_templates"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_templates_name_version_key" ON "checklist_templates"("name", "version");

-- CreateIndex
CREATE INDEX "checklist_items_templateId_idx" ON "checklist_items"("templateId");

-- CreateIndex
CREATE INDEX "checklist_items_type_idx" ON "checklist_items"("type");

-- CreateIndex
CREATE INDEX "checklist_items_isRequired_idx" ON "checklist_items"("isRequired");

-- CreateIndex
CREATE INDEX "checklist_items_isActive_idx" ON "checklist_items"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_items_templateId_sequence_key" ON "checklist_items"("templateId", "sequence");

-- CreateIndex
CREATE INDEX "checklist_item_completions_caseStageId_idx" ON "checklist_item_completions"("caseStageId");

-- CreateIndex
CREATE INDEX "checklist_item_completions_itemId_idx" ON "checklist_item_completions"("itemId");

-- CreateIndex
CREATE INDEX "checklist_item_completions_isCompleted_idx" ON "checklist_item_completions"("isCompleted");

-- CreateIndex
CREATE INDEX "checklist_item_completions_completedBy_idx" ON "checklist_item_completions"("completedBy");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_item_completions_caseStageId_itemId_key" ON "checklist_item_completions"("caseStageId", "itemId");

-- CreateIndex
CREATE INDEX "digital_signatures_userId_idx" ON "digital_signatures"("userId");

-- CreateIndex
CREATE INDEX "digital_signatures_signatureType_idx" ON "digital_signatures"("signatureType");

-- CreateIndex
CREATE INDEX "digital_signatures_entityType_entityId_idx" ON "digital_signatures"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "digital_signatures_isActive_idx" ON "digital_signatures"("isActive");

-- CreateIndex
CREATE INDEX "digital_signatures_createdAt_idx" ON "digital_signatures"("createdAt");

-- CreateIndex
CREATE INDEX "approval_workflows_caseId_idx" ON "approval_workflows"("caseId");

-- CreateIndex
CREATE INDEX "approval_workflows_stage_idx" ON "approval_workflows"("stage");

-- CreateIndex
CREATE INDEX "approval_workflows_status_idx" ON "approval_workflows"("status");

-- CreateIndex
CREATE INDEX "approval_workflows_initiatedBy_idx" ON "approval_workflows"("initiatedBy");

-- CreateIndex
CREATE INDEX "approval_workflows_dueDate_idx" ON "approval_workflows"("dueDate");

-- CreateIndex
CREATE INDEX "approvals_workflowId_idx" ON "approvals"("workflowId");

-- CreateIndex
CREATE INDEX "approvals_userId_idx" ON "approvals"("userId");

-- CreateIndex
CREATE INDEX "approvals_decision_idx" ON "approvals"("decision");

-- CreateIndex
CREATE INDEX "approvals_reviewedAt_idx" ON "approvals"("reviewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "approvals_workflowId_userId_key" ON "approvals"("workflowId", "userId");

-- CreateIndex
CREATE INDEX "time_tracking_caseId_idx" ON "time_tracking"("caseId");

-- CreateIndex
CREATE INDEX "time_tracking_stage_idx" ON "time_tracking"("stage");

-- CreateIndex
CREATE INDEX "time_tracking_action_idx" ON "time_tracking"("action");

-- CreateIndex
CREATE INDEX "time_tracking_userId_idx" ON "time_tracking"("userId");

-- CreateIndex
CREATE INDEX "time_tracking_startTime_idx" ON "time_tracking"("startTime");

-- CreateIndex
CREATE INDEX "review_assignments_caseId_idx" ON "review_assignments"("caseId");

-- CreateIndex
CREATE INDEX "review_assignments_reviewType_idx" ON "review_assignments"("reviewType");

-- CreateIndex
CREATE INDEX "review_assignments_assignedTo_idx" ON "review_assignments"("assignedTo");

-- CreateIndex
CREATE INDEX "review_assignments_status_idx" ON "review_assignments"("status");

-- CreateIndex
CREATE INDEX "review_assignments_dueDate_idx" ON "review_assignments"("dueDate");

-- CreateIndex
CREATE INDEX "reviews_assignmentId_idx" ON "reviews"("assignmentId");

-- CreateIndex
CREATE INDEX "reviews_reviewerId_idx" ON "reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "reviews_decision_idx" ON "reviews"("decision");

-- CreateIndex
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- CreateIndex
CREATE INDEX "observations_caseId_idx" ON "observations"("caseId");

-- CreateIndex
CREATE INDEX "observations_stage_idx" ON "observations"("stage");

-- CreateIndex
CREATE INDEX "observations_priority_idx" ON "observations"("priority");

-- CreateIndex
CREATE INDEX "observations_status_idx" ON "observations"("status");

-- CreateIndex
CREATE INDEX "observations_observedBy_idx" ON "observations"("observedBy");

-- CreateIndex
CREATE INDEX "observations_assignedTo_idx" ON "observations"("assignedTo");

-- CreateIndex
CREATE INDEX "observations_deadline_idx" ON "observations"("deadline");

-- CreateIndex
CREATE INDEX "observation_responses_observationId_idx" ON "observation_responses"("observationId");

-- CreateIndex
CREATE INDEX "observation_responses_userId_idx" ON "observation_responses"("userId");

-- CreateIndex
CREATE INDEX "observation_responses_responseType_idx" ON "observation_responses"("responseType");

-- CreateIndex
CREATE INDEX "observation_responses_createdAt_idx" ON "observation_responses"("createdAt");

-- CreateIndex
CREATE INDEX "validation_rules_type_idx" ON "validation_rules"("type");

-- CreateIndex
CREATE INDEX "validation_rules_stage_idx" ON "validation_rules"("stage");

-- CreateIndex
CREATE INDEX "validation_rules_isActive_idx" ON "validation_rules"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "validation_rules_name_version_key" ON "validation_rules"("name", "version");

-- CreateIndex
CREATE INDEX "validation_executions_ruleId_idx" ON "validation_executions"("ruleId");

-- CreateIndex
CREATE INDEX "validation_executions_caseId_idx" ON "validation_executions"("caseId");

-- CreateIndex
CREATE INDEX "validation_executions_stage_idx" ON "validation_executions"("stage");

-- CreateIndex
CREATE INDEX "validation_executions_entityType_entityId_idx" ON "validation_executions"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "validation_executions_passed_idx" ON "validation_executions"("passed");

-- CreateIndex
CREATE INDEX "validation_executions_executedAt_idx" ON "validation_executions"("executedAt");

-- CreateIndex
CREATE INDEX "risk_assessments_caseId_idx" ON "risk_assessments"("caseId");

-- CreateIndex
CREATE INDEX "risk_assessments_stage_idx" ON "risk_assessments"("stage");

-- CreateIndex
CREATE INDEX "risk_assessments_riskLevel_idx" ON "risk_assessments"("riskLevel");

-- CreateIndex
CREATE INDEX "risk_assessments_riskScore_idx" ON "risk_assessments"("riskScore");

-- CreateIndex
CREATE INDEX "risk_assessments_assessedBy_idx" ON "risk_assessments"("assessedBy");

-- CreateIndex
CREATE INDEX "risk_assessments_status_idx" ON "risk_assessments"("status");

-- CreateIndex
CREATE INDEX "risk_alerts_riskAssessmentId_idx" ON "risk_alerts"("riskAssessmentId");

-- CreateIndex
CREATE INDEX "risk_alerts_alertType_idx" ON "risk_alerts"("alertType");

-- CreateIndex
CREATE INDEX "risk_alerts_severity_idx" ON "risk_alerts"("severity");

-- CreateIndex
CREATE INDEX "risk_alerts_isActive_idx" ON "risk_alerts"("isActive");

-- CreateIndex
CREATE INDEX "risk_alerts_createdAt_idx" ON "risk_alerts"("createdAt");

-- CreateIndex
CREATE INDEX "system_configurations_category_idx" ON "system_configurations"("category");

-- CreateIndex
CREATE INDEX "system_configurations_environment_idx" ON "system_configurations"("environment");

-- CreateIndex
CREATE INDEX "system_configurations_effectiveAt_idx" ON "system_configurations"("effectiveAt");

-- CreateIndex
CREATE INDEX "system_configurations_expiresAt_idx" ON "system_configurations"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_configurations_key_environment_key" ON "system_configurations"("key", "environment");

-- CreateIndex
CREATE INDEX "system_configuration_history_configurationId_idx" ON "system_configuration_history"("configurationId");

-- CreateIndex
CREATE INDEX "system_configuration_history_key_idx" ON "system_configuration_history"("key");

-- CreateIndex
CREATE INDEX "system_configuration_history_category_idx" ON "system_configuration_history"("category");

-- CreateIndex
CREATE INDEX "system_configuration_history_changedBy_idx" ON "system_configuration_history"("changedBy");

-- CreateIndex
CREATE INDEX "system_configuration_history_createdAt_idx" ON "system_configuration_history"("createdAt");

-- CreateIndex
CREATE INDEX "system_templates_type_idx" ON "system_templates"("type");

-- CreateIndex
CREATE INDEX "system_templates_category_idx" ON "system_templates"("category");

-- CreateIndex
CREATE INDEX "system_templates_status_idx" ON "system_templates"("status");

-- CreateIndex
CREATE INDEX "system_templates_isActive_idx" ON "system_templates"("isActive");

-- CreateIndex
CREATE INDEX "system_templates_isDefault_idx" ON "system_templates"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "system_templates_name_type_version_key" ON "system_templates"("name", "type", "version");

-- CreateIndex
CREATE INDEX "system_template_versions_templateId_idx" ON "system_template_versions"("templateId");

-- CreateIndex
CREATE INDEX "system_template_versions_version_idx" ON "system_template_versions"("version");

-- CreateIndex
CREATE INDEX "system_template_versions_createdAt_idx" ON "system_template_versions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_template_versions_templateId_version_key" ON "system_template_versions"("templateId", "version");

-- CreateIndex
CREATE INDEX "system_template_tests_templateId_idx" ON "system_template_tests"("templateId");

-- CreateIndex
CREATE INDEX "system_template_tests_status_idx" ON "system_template_tests"("status");

-- CreateIndex
CREATE INDEX "system_template_tests_testRunAt_idx" ON "system_template_tests"("testRunAt");

-- CreateIndex
CREATE INDEX "backup_configurations_isActive_idx" ON "backup_configurations"("isActive");

-- CreateIndex
CREATE INDEX "backup_configurations_type_idx" ON "backup_configurations"("type");

-- CreateIndex
CREATE INDEX "backup_configurations_nextRunAt_idx" ON "backup_configurations"("nextRunAt");

-- CreateIndex
CREATE INDEX "backup_jobs_configurationId_idx" ON "backup_jobs"("configurationId");

-- CreateIndex
CREATE INDEX "backup_jobs_status_idx" ON "backup_jobs"("status");

-- CreateIndex
CREATE INDEX "backup_jobs_type_idx" ON "backup_jobs"("type");

-- CreateIndex
CREATE INDEX "backup_jobs_createdAt_idx" ON "backup_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "backup_jobs_completedAt_idx" ON "backup_jobs"("completedAt");

-- CreateIndex
CREATE INDEX "restoration_jobs_backupJobId_idx" ON "restoration_jobs"("backupJobId");

-- CreateIndex
CREATE INDEX "restoration_jobs_status_idx" ON "restoration_jobs"("status");

-- CreateIndex
CREATE INDEX "restoration_jobs_type_idx" ON "restoration_jobs"("type");

-- CreateIndex
CREATE INDEX "restoration_jobs_createdAt_idx" ON "restoration_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "restoration_jobs_completedAt_idx" ON "restoration_jobs"("completedAt");

-- CreateIndex
CREATE INDEX "system_logs_level_idx" ON "system_logs"("level");

-- CreateIndex
CREATE INDEX "system_logs_category_idx" ON "system_logs"("category");

-- CreateIndex
CREATE INDEX "system_logs_userId_idx" ON "system_logs"("userId");

-- CreateIndex
CREATE INDEX "system_logs_createdAt_idx" ON "system_logs"("createdAt");

-- CreateIndex
CREATE INDEX "system_logs_sessionId_idx" ON "system_logs"("sessionId");

-- CreateIndex
CREATE INDEX "system_logs_requestId_idx" ON "system_logs"("requestId");

-- CreateIndex
CREATE INDEX "system_logs_ipAddress_idx" ON "system_logs"("ipAddress");

-- CreateIndex
CREATE INDEX "system_logs_tags_idx" ON "system_logs"("tags");

-- CreateIndex
CREATE INDEX "performance_metrics_name_idx" ON "performance_metrics"("name");

-- CreateIndex
CREATE INDEX "performance_metrics_category_idx" ON "performance_metrics"("category");

-- CreateIndex
CREATE INDEX "performance_metrics_status_idx" ON "performance_metrics"("status");

-- CreateIndex
CREATE INDEX "performance_metrics_createdAt_idx" ON "performance_metrics"("createdAt");

-- CreateIndex
CREATE INDEX "performance_metrics_source_idx" ON "performance_metrics"("source");

-- CreateIndex
CREATE INDEX "holiday_calendars_year_idx" ON "holiday_calendars"("year");

-- CreateIndex
CREATE INDEX "holiday_calendars_country_idx" ON "holiday_calendars"("country");

-- CreateIndex
CREATE INDEX "holiday_calendars_region_idx" ON "holiday_calendars"("region");

-- CreateIndex
CREATE INDEX "holiday_calendars_isActive_idx" ON "holiday_calendars"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_calendars_name_year_country_region_key" ON "holiday_calendars"("name", "year", "country", "region");

-- CreateIndex
CREATE INDEX "holidays_calendarId_idx" ON "holidays"("calendarId");

-- CreateIndex
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- CreateIndex
CREATE INDEX "holidays_type_idx" ON "holidays"("type");

-- CreateIndex
CREATE INDEX "holidays_isActive_idx" ON "holidays"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_calendarId_date_key" ON "holidays"("calendarId", "date");

-- CreateIndex
CREATE INDEX "stage_time_configurations_stage_idx" ON "stage_time_configurations"("stage");

-- CreateIndex
CREATE INDEX "stage_time_configurations_departmentId_idx" ON "stage_time_configurations"("departmentId");

-- CreateIndex
CREATE INDEX "stage_time_configurations_isActive_idx" ON "stage_time_configurations"("isActive");

-- CreateIndex
CREATE INDEX "stage_time_configurations_effectiveFrom_idx" ON "stage_time_configurations"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "stage_time_configurations_stage_departmentId_key" ON "stage_time_configurations"("stage", "departmentId");

-- CreateIndex
CREATE INDEX "security_policies_type_idx" ON "security_policies"("type");

-- CreateIndex
CREATE INDEX "security_policies_category_idx" ON "security_policies"("category");

-- CreateIndex
CREATE INDEX "security_policies_isEnabled_idx" ON "security_policies"("isEnabled");

-- CreateIndex
CREATE INDEX "security_policies_enforcementLevel_idx" ON "security_policies"("enforcementLevel");

-- CreateIndex
CREATE UNIQUE INDEX "security_policies_name_type_key" ON "security_policies"("name", "type");

-- CreateIndex
CREATE INDEX "usage_statistics_category_idx" ON "usage_statistics"("category");

-- CreateIndex
CREATE INDEX "usage_statistics_metric_idx" ON "usage_statistics"("metric");

-- CreateIndex
CREATE INDEX "usage_statistics_period_idx" ON "usage_statistics"("period");

-- CreateIndex
CREATE INDEX "usage_statistics_periodStart_idx" ON "usage_statistics"("periodStart");

-- CreateIndex
CREATE INDEX "usage_statistics_periodEnd_idx" ON "usage_statistics"("periodEnd");

-- CreateIndex
CREATE INDEX "usage_statistics_departmentId_idx" ON "usage_statistics"("departmentId");

-- CreateIndex
CREATE INDEX "usage_statistics_userId_idx" ON "usage_statistics"("userId");

-- CreateIndex
CREATE INDEX "usage_statistics_createdAt_idx" ON "usage_statistics"("createdAt");

-- CreateIndex
CREATE INDEX "system_notification_channels_type_idx" ON "system_notification_channels"("type");

-- CreateIndex
CREATE INDEX "system_notification_channels_isEnabled_idx" ON "system_notification_channels"("isEnabled");

-- CreateIndex
CREATE INDEX "system_notification_channels_priority_idx" ON "system_notification_channels"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "system_notification_channels_name_type_key" ON "system_notification_channels"("name", "type");

-- CreateIndex
CREATE INDEX "system_health_checks_category_idx" ON "system_health_checks"("category");

-- CreateIndex
CREATE INDEX "system_health_checks_status_idx" ON "system_health_checks"("status");

-- CreateIndex
CREATE INDEX "system_health_checks_isActive_idx" ON "system_health_checks"("isActive");

-- CreateIndex
CREATE INDEX "system_health_checks_lastCheckedAt_idx" ON "system_health_checks"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "favorites_type_idx" ON "favorites"("type");

-- CreateIndex
CREATE INDEX "favorites_itemId_idx" ON "favorites"("itemId");

-- CreateIndex
CREATE INDEX "favorites_createdAt_idx" ON "favorites"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_type_itemId_key" ON "favorites"("userId", "type", "itemId");

-- CreateIndex
CREATE INDEX "activities_userId_createdAt_idx" ON "activities"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "activities_entityType_entityId_idx" ON "activities"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activities_createdAt_userId_idx" ON "activities"("createdAt", "userId");

-- CreateIndex
CREATE INDEX "cases_departmentId_status_idx" ON "cases"("departmentId", "status");

-- CreateIndex
CREATE INDEX "cases_status_priority_idx" ON "cases"("status", "priority");

-- CreateIndex
CREATE INDEX "cases_departmentId_currentStage_idx" ON "cases"("departmentId", "currentStage");

-- CreateIndex
CREATE INDEX "cases_createdAt_expectedEndDate_idx" ON "cases"("createdAt", "expectedEndDate");

-- CreateIndex
CREATE INDEX "cases_deletedAt_status_idx" ON "cases"("deletedAt", "status");

-- CreateIndex
CREATE INDEX "cases_deletedAt_departmentId_idx" ON "cases"("deletedAt", "departmentId");

-- CreateIndex
CREATE INDEX "cases_status_currentStage_idx" ON "cases"("status", "currentStage");

-- CreateIndex
CREATE INDEX "cases_departmentId_priority_idx" ON "cases"("departmentId", "priority");

-- CreateIndex
CREATE INDEX "users_departmentId_isActive_idx" ON "users"("departmentId", "isActive");

-- CreateIndex
CREATE INDEX "users_isActive_lastLoginAt_idx" ON "users"("isActive", "lastLoginAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_isActive_idx" ON "users"("deletedAt", "isActive");

-- CreateIndex
CREATE INDEX "users_roleId_isActive_idx" ON "users"("roleId", "isActive");

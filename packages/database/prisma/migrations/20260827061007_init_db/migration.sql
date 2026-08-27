/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "roles" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ISSUE_STATUS" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "role" "roles" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "board" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "boardId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "ISSUE_STATUS" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_assignee" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "issueId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_assignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "issueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "membership_userId_organizationId_key" ON "membership"("userId", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "issue_assignee_userId_issueId_key" ON "issue_assignee"("userId", "issueId");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board" ADD CONSTRAINT "board_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue" ADD CONSTRAINT "issue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_assignee" ADD CONSTRAINT "issue_assignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_assignee" ADD CONSTRAINT "issue_assignee_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

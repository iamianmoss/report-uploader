import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    project: process.env.VERCEL_PROJECT_PRODUCTION_URL || null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    repo: process.env.VERCEL_GIT_REPO_OWNER + '/' + process.env.VERCEL_GIT_REPO_SLUG
  });
}
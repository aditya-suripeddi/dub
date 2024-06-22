import { withWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DomainSchema } from "@/lib/zod/schemas/domains";
import { NextResponse } from "next/server";

// POST /api/domains/[domain]/primary – set a domain as primary
export const POST = withWorkspace(
  async ({ headers, workspace, domain }) => {
    const [domainRecord] = await Promise.all([
      prisma.domain.update({
        where: {
          slug: domain,
        },
        data: {
          primary: true,
        },
      }),
      // Set all other domains as not primary
      prisma.domain.updateMany({
        where: {
          projectId: workspace.id,
          primary: true,
          slug: {
            not: domain,
          },
        },
        data: {
          primary: false,
        },
      }),
    ]);

    return NextResponse.json(DomainSchema.parse(domainRecord), { headers });
  },
  {
    domainChecks: true,
    requiredScopes: ["domains.write"],
  },
);

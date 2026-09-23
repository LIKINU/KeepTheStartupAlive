import { NextResponse } from "next/server";
import { z } from "zod";
import { canEdit, getScopedMeeting, requireAuth } from "@/lib/access-control";
import { getDb } from "@/lib/db";
import { parseJson } from "@/lib/domain";
import { toJson } from "@/lib/serializers";
import { writeAuditLog } from "@/lib/tenant";

const addParticipantSchema = z.object({
  roleName: z.string().min(1).max(80),
  view: z.string().max(2000).optional().default(""),
});

type ParticipantView = { roleName: string; view: string };

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await requireAuth();
  if ("error" in session) return session.error;
  const auth = session.auth;
  if (!canEdit(auth.user.role)) {
    return NextResponse.json({ error: "需要管理员或编辑者权限" }, { status: 403 });
  }

  const parsed = addParticipantSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const { roleName, view } = parsed.data;

  const db = getDb();
  const { tenant, meeting } = await getScopedMeeting(id);
  if (!meeting) return NextResponse.json({ error: "未找到会议" }, { status: 404 });

  const participantViews = parseJson<ParticipantView[]>(meeting.participantViews, []);
  if (participantViews.some((p) => p.roleName === roleName)) {
    return NextResponse.json({ error: "该角色已在会议中" }, { status: 409 });
  }

  const updated = [...participantViews, { roleName, view }];
  await db.strategyMeeting.update({
    where: { id: meeting.id },
    data: { participantViews: toJson(updated) },
  });

  await writeAuditLog({
    tenantId: tenant.id,
    actor: auth.user.email ?? "demo",
    action: "meeting.participant.added",
    entityType: "StrategyMeeting",
    entityId: meeting.id,
    metadata: { roleName },
  });

  return NextResponse.json({ participantViews: updated });
}

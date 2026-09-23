import { AppShell, EmptyState, PageHeader, Panel } from "@/components/app-shell";
import { RoleTemplateGrid, type RoleCard } from "@/components/role-template-grid";
import { ensureDatabase } from "@/lib/bootstrap-db";
import { ensureRoleTemplates } from "@/lib/seed";
import { getActiveWorkspace } from "@/lib/workspace";
import { getDb } from "@/lib/db";
import { parseCapabilities, parseStringList } from "@/lib/serializers";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await ensureDatabase();
  await ensureRoleTemplates();
  const workspace = await getActiveWorkspace();
  const roles = await getDb().roleTemplate.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
  const teamMembers = workspace ? await getDb().teamMember.findMany({ where: { workspaceId: workspace.id }, include: { distillationProfile: true } }) : [];

  const roleCards: RoleCard[] = roles.map((role) => ({
    id: role.id,
    name: role.name,
    category: role.category,
    sandboxCount: parseStringList(role.sandboxTypes).length,
    description: role.description,
    capabilities: Object.entries(parseCapabilities(role.defaultCapabilities)).map(([key, value]) => ({
      key,
      value,
    })),
  }));

  return (
    <AppShell>
      <PageHeader title="全生命周期角色模板库" description="覆盖 OPC、初创团队、成长期和成熟公司，支持经营角色、专业支持、外部利益相关方和未来发展角色。" />

      {teamMembers.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <span className="size-1.5 rounded-full bg-cyan-300" />
              数字孪生角色
            </span>
            <span className="text-xs text-[var(--muted)]">由资料蒸馏生成，参与经营会议推演</span>
          </div>
          <div className="grid gap-4 grid-cols-2">
            {teamMembers.map((member) => (
              <Panel key={member.id} className="border-cyan-300/25 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">{member.name}</h2>
                      {member.distillationProfile ? (
                        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/15 px-2 py-0.5 text-xs text-cyan-200">已蒸馏</span>
                      ) : (
                        <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-xs text-amber-200">未蒸馏</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)]">{member.roleName}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-xs text-slate-400">
                    {member.isRealMember ? "真实成员" : "虚拟角色"}
                  </span>
                </div>
                {member.distillationProfile && (
                  <div className="mt-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-2">
                    <p className="text-xs leading-5 text-cyan-200/80">
                      语言风格：{member.distillationProfile.languageStyle} · 决策倾向：{member.distillationProfile.decisionPreference}
                    </p>
                  </div>
                )}
              </Panel>
            ))}
          </div>
        </section>
      )}

      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/25 bg-slate-300/10 px-3 py-1 text-xs font-semibold text-slate-200">
          <span className="size-1.5 rounded-full bg-slate-400" />
          默认角色模板
        </span>
        <span className="text-xs text-[var(--muted)]">系统内置，可直接套用到沙盘</span>
      </div>
      <RoleTemplateGrid roles={roleCards} />
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { Panel, MetricBar } from "@/components/app-shell";

const capabilityLabels: Record<string, string> = {
  sales: "销售",
  technology: "技术",
  management: "管理",
  operations: "运营",
  financing: "融资",
  strategy: "战略",
};

export type RoleCard = {
  id: string;
  name: string;
  category: string;
  sandboxCount: number;
  description: string;
  capabilities: { key: string; value: number }[];
};

const COLLAPSE_THRESHOLD = 8;

export function RoleTemplateGrid({ roles }: { roles: RoleCard[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? roles : roles.slice(0, COLLAPSE_THRESHOLD);
  const hiddenCount = roles.length - visible.length;

  if (roles.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">暂无角色模板。</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2">
        {visible.map((role) => (
          <Panel key={role.id} className="p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{role.name}</h2>
                  <span className="rounded-full border border-slate-300/30 bg-slate-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                    默认模板
                  </span>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">{role.category}</p>
              </div>
              <span className="rounded-md border border-[var(--line)] px-2 py-1 text-xs text-[var(--muted)]">
                {role.sandboxCount} 类沙盘
              </span>
            </div>
            <p className="mb-4 text-sm leading-6 text-[var(--muted)]">{role.description}</p>
            <div className="grid gap-2">
              {role.capabilities.map((cap) => (
                <MetricBar
                  key={cap.key}
                  label={capabilityLabels[cap.key] ?? cap.key}
                  value={cap.value}
                />
              ))}
            </div>
          </Panel>
        ))}
      </div>

      {roles.length > COLLAPSE_THRESHOLD && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full rounded-lg border border-[var(--line)] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07]"
        >
          {expanded ? "收起" : `展开全部 ${roles.length} 个角色模板`}
        </button>
      )}
    </div>
  );
}

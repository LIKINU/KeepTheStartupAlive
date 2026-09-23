"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TeamMemberOption = { id: string; name: string; roleName: string };

export function MeetingParticipantAdder({
  meetingId,
  existingRoleNames,
  teamMembers,
}: {
  meetingId: string;
  existingRoleNames: string[];
  teamMembers: TeamMemberOption[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = teamMembers.filter((m) => !existingRoleNames.includes(m.roleName));

  async function handleAdd() {
    const member = teamMembers.find((m) => m.id === selectedId);
    if (!member) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName: member.roleName || member.name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "添加失败");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    } finally {
      setBusy(false);
      setSelectedId("");
    }
  }

  if (available.length === 0) {
    return (
      <p className="text-xs text-[var(--muted)]">
        所有团队成员都已加入本次会议，或当前工作区还没有团队成员。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-md border border-[var(--line)] bg-white/[0.04] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
        >
          <option value="">选择团队成员…</option>
          {available.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}（{m.roleName}）
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedId || busy}
          className="glass-primary-button rounded-md px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          {busy ? "添加中…" : "添加到会议"}
        </button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

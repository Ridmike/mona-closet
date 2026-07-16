// app/admin/messages/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getContactMessages,
  markMessageRead,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/db/content";
import {
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
  Clock,
  User,
  AtSign,
  MessageSquare,
  CheckCheck,
  Circle,
} from "lucide-react";
import { useToast } from "@/components/shared/Toast";

type Tab = "all" | "unread" | "read";

export default function MessagesPage() {
  const [messages, setMessages]     = useState<ContactMessage[]>([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState<Tab>("all");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [toggling, setToggling]     = useState<string | null>(null);
  const { toast }                   = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getContactMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const unreadCount = messages.filter(m => !m.read).length;
  const readCount   = messages.filter(m =>  m.read).length;

  const filtered = messages.filter(m =>
    tab === "all"    ? true :
    tab === "unread" ? !m.read :
                        m.read
  );

  const handleToggleRead = async (msg: ContactMessage) => {
    setToggling(msg.id);
    try {
      await markMessageRead(msg.id, !msg.read);
      setMessages(prev =>
        prev.map(m => m.id === msg.id ? { ...m, read: !m.read } : m)
      );
      toast(msg.read ? "Marked as unread" : "Marked as read", "success");
    } catch {
      toast("Failed to update status.", "error");
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expanded === id) setExpanded(null);
      toast("Message deleted.", "success");
    } catch {
      toast("Failed to delete message.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleExpand = async (msg: ContactMessage) => {
    const isOpening = expanded !== msg.id;
    setExpanded(isOpening ? msg.id : null);

    // Auto-mark as read when opened
    if (isOpening && !msg.read) {
      try {
        await markMessageRead(msg.id, true);
        setMessages(prev =>
          prev.map(m => m.id === msg.id ? { ...m, read: true } : m)
        );
      } catch { /* silent */ }
    }
  };

  const handleMarkAllRead = async () => {
    const unread = messages.filter(m => !m.read);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(m => markMessageRead(m.id, true)));
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      toast(`${unread.length} message${unread.length > 1 ? "s" : ""} marked as read.`, "success");
    } catch {
      toast("Failed to mark all as read.", "error");
    }
  };

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "all",    label: "All",    count: messages.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read",   label: "Read",   count: readCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-zinc-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-mauve" />
            Contact Messages
            {unreadCount > 0 && (
              <span className="bg-brand-mauve text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Customer enquiries and contact form submissions.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-brand-mauve transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-medium bg-white border border-zinc-200 hover:border-brand-mauve hover:text-brand-mauve transition-colors px-3 py-2 rounded-lg shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              tab === t.key
                ? t.key === "unread" ? "bg-brand-mauve text-white" : "bg-zinc-100 text-zinc-600"
                : "bg-zinc-200 text-zinc-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-zinc-300 animate-spin" />
          <p className="text-sm text-zinc-400">Loading messages…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
          <MessageSquare className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-zinc-400">
            {tab === "unread" ? "No unread messages" :
             tab === "read"   ? "No read messages" :
                                "No messages yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(msg => (
            <div
              key={msg.id}
              className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                !msg.read
                  ? "border-brand-mauve/30 shadow-sm shadow-brand-mauve/10"
                  : "border-zinc-200"
              }`}
            >
              {/* Row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => handleExpand(msg)}
              >
                {/* Read indicator dot */}
                <div className="shrink-0">
                  {msg.read
                    ? <MailOpen className="w-5 h-5 text-zinc-300" />
                    : <Mail className="w-5 h-5 text-brand-mauve" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-x-6 gap-y-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className={`text-sm truncate ${!msg.read ? "font-semibold text-zinc-800" : "font-medium text-zinc-600"}`}>
                      {msg.name}
                    </span>
                    {!msg.read && (
                      <Circle className="w-2 h-2 fill-brand-mauve text-brand-mauve shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <AtSign className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="text-xs text-zinc-500 truncate">{msg.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {msg.createdAt.toLocaleDateString("en-LK", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleRead(msg)}
                    disabled={toggling === msg.id}
                    title={msg.read ? "Mark as unread" : "Mark as read"}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      msg.read
                        ? "text-zinc-400 hover:text-brand-mauve hover:bg-brand-mist"
                        : "text-brand-mauve hover:bg-brand-mist"
                    }`}
                  >
                    {msg.read
                      ? <Mail className="w-4 h-4" />
                      : <MailOpen className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    disabled={deleting === msg.id}
                    title="Delete message"
                    className="p-2 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded body */}
              {expanded === msg.id && (
                <div className="px-5 pb-5 pt-1 border-t border-zinc-100 bg-zinc-50/60 space-y-3">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
                    <span><strong className="text-zinc-700">Subject:</strong> {msg.subject || "(no subject)"}</span>
                    <span><strong className="text-zinc-700">From:</strong> {msg.name} &lt;{msg.email}&gt;</span>
                  </div>
                  <div className="bg-white border border-zinc-200 rounded-lg p-4 text-sm text-zinc-700 font-body leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-plum text-white px-4 py-2 rounded-lg hover:bg-brand-mauve transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                    <button
                      onClick={() => handleToggleRead(msg)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg hover:border-brand-mauve hover:text-brand-mauve transition-colors"
                    >
                      {msg.read ? <><Mail className="w-3.5 h-3.5" /> Mark Unread</> : <><MailOpen className="w-3.5 h-3.5" /> Mark Read</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

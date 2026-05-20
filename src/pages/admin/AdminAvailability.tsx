import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Counselor { id: string; name: string; }
interface Slot { id: string; counselor_id: string; weekday: number; start_time: string; end_time: string; active: boolean; }
interface TimeOff { id: string; counselor_id: string; start_at: string; end_at: string; reason: string | null; }

const AdminAvailability = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cs } = await supabase.from("counselors").select("id, name").eq("active", true).order("display_order");
      setCounselors(cs || []);
      if (cs?.length) setSelectedId(cs[0].id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      const [{ data: s }, { data: t }] = await Promise.all([
        supabase.from("counselor_availability").select("*").eq("counselor_id", selectedId).order("weekday"),
        supabase.from("counselor_time_off").select("*").eq("counselor_id", selectedId).order("start_at"),
      ]);
      setSlots((s as Slot[]) || []);
      setTimeOff((t as TimeOff[]) || []);
    })();
  }, [selectedId]);

  const addSlot = async (weekday: number) => {
    const { data, error } = await supabase.from("counselor_availability")
      .insert({ counselor_id: selectedId, weekday, start_time: "09:00", end_time: "17:00", active: true })
      .select().single();
    if (error) return toast.error(error.message);
    setSlots((p) => [...p, data as Slot]);
  };

  const updateSlot = async (id: string, patch: Partial<Slot>) => {
    setSlots((p) => p.map((s) => s.id === id ? { ...s, ...patch } : s));
    const { error } = await supabase.from("counselor_availability").update(patch).eq("id", id);
    if (error) toast.error(error.message);
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("counselor_availability").delete().eq("id", id);
    setSlots((p) => p.filter((s) => s.id !== id));
  };

  const addTimeOff = async () => {
    const start = prompt("Start date/time (YYYY-MM-DD HH:MM)"); if (!start) return;
    const end = prompt("End date/time (YYYY-MM-DD HH:MM)"); if (!end) return;
    const reason = prompt("Reason (optional)") || null;
    const { data, error } = await supabase.from("counselor_time_off")
      .insert({ counselor_id: selectedId, start_at: new Date(start).toISOString(), end_at: new Date(end).toISOString(), reason })
      .select().single();
    if (error) return toast.error(error.message);
    setTimeOff((p) => [...p, data as TimeOff]);
  };

  const deleteTimeOff = async (id: string) => {
    await supabase.from("counselor_time_off").delete().eq("id", id);
    setTimeOff((p) => p.filter((t) => t.id !== id));
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (counselors.length === 0) return <p className="text-muted-foreground">Add a counselor first.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-heading text-2xl font-bold text-foreground">Availability</h1>
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-card text-sm">
          {counselors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-heading font-semibold text-foreground mb-4">Weekly Hours</h2>
        <div className="space-y-3">
          {DAYS.map((day, idx) => {
            const daySlots = slots.filter((s) => s.weekday === idx);
            return (
              <div key={idx} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <div className="w-14 pt-2 font-medium text-sm text-foreground">{day}</div>
                <div className="flex-1 space-y-2">
                  {daySlots.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 flex-wrap">
                      <input type="time" value={s.start_time.slice(0, 5)} onChange={(e) => updateSlot(s.id, { start_time: e.target.value })} className="px-2 py-1 rounded border border-input bg-background text-sm" />
                      <span className="text-muted-foreground text-sm">–</span>
                      <input type="time" value={s.end_time.slice(0, 5)} onChange={(e) => updateSlot(s.id, { end_time: e.target.value })} className="px-2 py-1 rounded border border-input bg-background text-sm" />
                      <label className="flex items-center gap-1 text-xs">
                        <input type="checkbox" checked={s.active} onChange={(e) => updateSlot(s.id, { active: e.target.checked })} /> active
                      </label>
                      <button onClick={() => deleteSlot(s.id)} className="text-destructive p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <button onClick={() => addSlot(idx)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Plus size={12} /> Add hours
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-foreground">Time Off</h2>
          <button onClick={addTimeOff} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded bg-primary text-primary-foreground"><Plus size={14} /> Add</button>
        </div>
        {timeOff.length === 0 ? <p className="text-sm text-muted-foreground">No time off scheduled.</p> : (
          <ul className="space-y-2">
            {timeOff.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm px-3 py-2 rounded bg-secondary/50">
                <span>{new Date(t.start_at).toLocaleString()} → {new Date(t.end_at).toLocaleString()} {t.reason ? `· ${t.reason}` : ""}</span>
                <button onClick={() => deleteTimeOff(t.id)} className="text-destructive"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminAvailability;

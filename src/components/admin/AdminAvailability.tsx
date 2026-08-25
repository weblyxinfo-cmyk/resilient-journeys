import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Clock, Calendar, Sun } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

const DAYS_OF_WEEK = [
  { value: 1, label: "Pondělí" },
  { value: 2, label: "Úterý" },
  { value: 3, label: "Středa" },
  { value: 4, label: "Čtvrtek" },
  { value: 5, label: "Pátek" },
  { value: 6, label: "Sobota" },
  { value: 0, label: "Neděle" },
];

const getDayLabel = (value: number) =>
  DAYS_OF_WEEK.find((d) => d.value === value)?.label ?? String(value);

interface TimeSlotEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface SeasonalGroup {
  key: string;
  schedule_name: string;
  effective_from: string;
  effective_until: string;
  rows: any[];
}

const AdminAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [availabilityList, setAvailabilityList] = useState<any[]>([]);
  const [blockedDatesList, setBlockedDatesList] = useState<any[]>([]);

  // Default availability dialog state
  const [availDialogOpen, setAvailDialogOpen] = useState(false);
  const [editingAvail, setEditingAvail] = useState<any>(null);
  const [availForm, setAvailForm] = useState({
    day_of_week: 1,
    start_time: "09:00",
    end_time: "17:00",
    is_active: true,
  });

  // Seasonal rule dialog state
  const [seasonalDialogOpen, setSeasonalDialogOpen] = useState(false);
  const [editingSeasonalKey, setEditingSeasonalKey] = useState<string | null>(null);
  const [seasonalForm, setSeasonalForm] = useState({
    schedule_name: "",
    effective_from: "",
    effective_until: "",
    timeSlots: [{ day_of_week: 1, start_time: "09:00", end_time: "17:00" }] as TimeSlotEntry[],
  });

  // Blocked dates dialog state
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [blockedForm, setBlockedForm] = useState({
    date: "",
    reason: "",
    is_full_day: true,
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchAvailability();
    fetchBlockedDates();
  }, []);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      toast.error("Chyba při načítání dostupnosti: " + error.message);
      return;
    }

    setAvailabilityList(data || []);
  };

  const fetchBlockedDates = async () => {
    const { data, error } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      toast.error("Chyba při načítání blokovaných dnů: " + error.message);
      return;
    }

    setBlockedDatesList(data || []);
  };

  // ─── Default availability helpers ───

  const defaultAvailability = availabilityList.filter(
    (a) => a.effective_from === null && a.effective_until === null
  );

  const availabilityByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.value] = defaultAvailability.filter((a) => a.day_of_week === day.value);
    return acc;
  }, {} as Record<number, any[]>);

  const resetAvailForm = () => {
    setAvailForm({
      day_of_week: 1,
      start_time: "09:00",
      end_time: "17:00",
      is_active: true,
    });
    setEditingAvail(null);
  };

  const handleAvailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (availForm.end_time <= availForm.start_time) {
        toast.error("Konec času musí být po začátku");
        return;
      }

      if (editingAvail) {
        const { error } = await supabase
          .from("availability")
          .update(availForm)
          .eq("id", editingAvail.id);

        if (error) throw error;
        toast.success("Dostupnost aktualizována");
      } else {
        const { error } = await supabase.from("availability").insert(availForm);
        if (error) throw error;
        toast.success("Dostupnost přidána");
      }

      setAvailDialogOpen(false);
      resetAvailForm();
      fetchAvailability();
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAvail = (avail: any) => {
    setEditingAvail(avail);
    setAvailForm({
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      is_active: avail.is_active,
    });
    setAvailDialogOpen(true);
  };

  const handleDeleteAvail = async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto dostupnost?")) return;

    const { error } = await supabase.from("availability").delete().eq("id", id);

    if (error) {
      toast.error("Chyba při mazání: " + error.message);
      return;
    }

    toast.success("Dostupnost smazána");
    fetchAvailability();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("availability")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) {
      toast.error("Chyba při změně stavu: " + error.message);
      return;
    }

    toast.success(currentActive ? "Dostupnost deaktivována" : "Dostupnost aktivována");
    fetchAvailability();
  };

  // ─── Seasonal rules helpers ───

  const seasonalAvailability = availabilityList.filter(
    (a) => a.effective_from !== null && a.effective_until !== null
  );

  const seasonalGroups: SeasonalGroup[] = (() => {
    const map = new Map<string, SeasonalGroup>();
    for (const row of seasonalAvailability) {
      const key = `${row.schedule_name || ""}|${row.effective_from}|${row.effective_until}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          schedule_name: row.schedule_name || "",
          effective_from: row.effective_from,
          effective_until: row.effective_until,
          rows: [],
        });
      }
      map.get(key)!.rows.push(row);
    }
    return Array.from(map.values()).sort(
      (a, b) => a.effective_from.localeCompare(b.effective_from)
    );
  })();

  const resetSeasonalForm = () => {
    setSeasonalForm({
      schedule_name: "",
      effective_from: "",
      effective_until: "",
      timeSlots: [{ day_of_week: 1, start_time: "09:00", end_time: "17:00" }],
    });
    setEditingSeasonalKey(null);
  };

  const handleEditSeasonal = (group: SeasonalGroup) => {
    setEditingSeasonalKey(group.key);
    setSeasonalForm({
      schedule_name: group.schedule_name,
      effective_from: group.effective_from,
      effective_until: group.effective_until,
      timeSlots: group.rows.map((r) => ({
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
      })),
    });
    setSeasonalDialogOpen(true);
  };

  const handleSeasonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { schedule_name, effective_from, effective_until, timeSlots } = seasonalForm;

      if (!schedule_name.trim()) {
        toast.error("Název pravidla je povinný");
        return;
      }
      if (!effective_from || !effective_until) {
        toast.error("Datum od a do je povinné");
        return;
      }
      if (effective_until < effective_from) {
        toast.error("Datum do musí být po datu od");
        return;
      }
      if (timeSlots.length === 0) {
        toast.error("Přidejte alespoň jeden časový slot");
        return;
      }
      for (const slot of timeSlots) {
        if (slot.end_time <= slot.start_time) {
          toast.error(`Konec času musí být po začátku (${getDayLabel(slot.day_of_week)})`);
          return;
        }
      }

      // If editing, delete old rows first
      if (editingSeasonalKey) {
        const group = seasonalGroups.find((g) => g.key === editingSeasonalKey);
        if (group) {
          const ids = group.rows.map((r: any) => r.id);
          const { error } = await supabase
            .from("availability")
            .delete()
            .in("id", ids);
          if (error) throw error;
        }
      }

      // Insert new rows
      const rows = timeSlots.map((slot) => ({
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_active: true,
        schedule_name: schedule_name.trim(),
        effective_from,
        effective_until,
      }));

      const { error } = await supabase.from("availability").insert(rows);
      if (error) throw error;

      toast.success(editingSeasonalKey ? "Sezónní pravidlo aktualizováno" : "Sezónní pravidlo přidáno");
      setSeasonalDialogOpen(false);
      resetSeasonalForm();
      fetchAvailability();
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeasonal = async (group: SeasonalGroup) => {
    if (!confirm(`Opravdu chcete smazat sezónní pravidlo "${group.schedule_name}"?`)) return;

    const ids = group.rows.map((r: any) => r.id);
    const { error } = await supabase
      .from("availability")
      .delete()
      .in("id", ids);

    if (error) {
      toast.error("Chyba při mazání: " + error.message);
      return;
    }

    toast.success("Sezónní pravidlo smazáno");
    fetchAvailability();
  };

  const addTimeSlot = () => {
    setSeasonalForm({
      ...seasonalForm,
      timeSlots: [
        ...seasonalForm.timeSlots,
        { day_of_week: 1, start_time: "09:00", end_time: "17:00" },
      ],
    });
  };

  const removeTimeSlot = (index: number) => {
    setSeasonalForm({
      ...seasonalForm,
      timeSlots: seasonalForm.timeSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlotEntry, value: any) => {
    const updated = [...seasonalForm.timeSlots];
    updated[index] = { ...updated[index], [field]: field === "day_of_week" ? parseInt(value) : value };
    setSeasonalForm({ ...seasonalForm, timeSlots: updated });
  };

  // ─── Blocked dates helpers ───

  const handleBlockedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!blockedForm.date) {
        toast.error("Datum je povinné");
        return;
      }

      const selectedDate = new Date(blockedForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        toast.error("Nelze blokovat dny v minulosti");
        return;
      }

      if (!blockedForm.is_full_day) {
        if (!blockedForm.start_time || !blockedForm.end_time) {
          toast.error("Vyplňte čas od a do");
          return;
        }
        if (blockedForm.end_time <= blockedForm.start_time) {
          toast.error("Konec času musí být po začátku");
          return;
        }
      }

      const { error } = await supabase.from("blocked_dates").insert({
        date: blockedForm.date,
        reason: blockedForm.reason || null,
        start_time: blockedForm.is_full_day ? null : blockedForm.start_time,
        end_time: blockedForm.is_full_day ? null : blockedForm.end_time,
      });

      if (error) throw error;

      toast.success("Den zablokován");
      setBlockedDialogOpen(false);
      setBlockedForm({ date: "", reason: "", is_full_day: true, start_time: "", end_time: "" });
      fetchBlockedDates();
    } catch (error: any) {
      toast.error("Chyba: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlocked = async (id: string) => {
    if (!confirm("Opravdu chcete odblokovat tento den?")) return;

    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);

    if (error) {
      toast.error("Chyba při mazání: " + error.message);
      return;
    }

    toast.success("Den odblokován");
    fetchBlockedDates();
  };

  return (
    <div className="space-y-8">
      {/* ═══ 1. Default Weekly Schedule ═══ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-serif font-semibold">Výchozí Rozvrh</h3>
            <p className="text-muted-foreground">Základní týdenní dostupnost (platí, pokud není aktivní sezónní pravidlo)</p>
          </div>
          <Dialog open={availDialogOpen} onOpenChange={setAvailDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetAvailForm} className="bg-gradient-gold">
                <Plus className="mr-2" size={16} />
                Přidat Dostupnost
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAvail ? "Upravit Dostupnost" : "Přidat Dostupnost"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAvailSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="day_of_week">Den v Týdnu</Label>
                  <Select
                    value={String(availForm.day_of_week)}
                    onValueChange={(value) =>
                      setAvailForm({ ...availForm, day_of_week: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_time">Začátek</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={availForm.start_time}
                    onChange={(e) => setAvailForm({ ...availForm, start_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_time">Konec</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={availForm.end_time}
                    onChange={(e) => setAvailForm({ ...availForm, end_time: e.target.value })}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={availForm.is_active}
                    onCheckedChange={(checked) =>
                      setAvailForm({ ...availForm, is_active: checked })
                    }
                  />
                  <Label>Aktivní</Label>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAvailDialogOpen(false);
                      resetAvailForm();
                    }}
                  >
                    Zrušit
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-gradient-gold">
                    {loading ? "Ukládám..." : editingAvail ? "Uložit" : "Přidat"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const dayAvailability = availabilityByDay[day.value] || [];
            return (
              <Card key={day.value}>
                <CardHeader>
                  <CardTitle className="text-lg">{day.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dayAvailability.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Žádná dostupnost</p>
                  ) : (
                    <div className="space-y-2">
                      {dayAvailability.map((avail) => (
                        <div
                          key={avail.id}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {avail.start_time} - {avail.end_time}
                            </span>
                            {!avail.is_active && (
                              <Badge variant="secondary" className="text-xs">
                                Neaktivní
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(avail.id, avail.is_active)}
                            >
                              <Switch checked={avail.is_active} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditAvail(avail)}>
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAvail(avail.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ═══ 2. Seasonal Rules ═══ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-serif font-semibold">Sezónní Pravidla</h3>
            <p className="text-muted-foreground">Jiná dostupnost pro určitá období (přebíjí výchozí rozvrh)</p>
          </div>
          <Dialog open={seasonalDialogOpen} onOpenChange={setSeasonalDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetSeasonalForm}
                className="bg-gradient-gold"
              >
                <Plus className="mr-2" size={16} />
                Přidat Pravidlo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSeasonalKey ? "Upravit Sezónní Pravidlo" : "Přidat Sezónní Pravidlo"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSeasonalSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="schedule_name">Název pravidla</Label>
                  <Input
                    id="schedule_name"
                    value={seasonalForm.schedule_name}
                    onChange={(e) => setSeasonalForm({ ...seasonalForm, schedule_name: e.target.value })}
                    placeholder="např. Léto, Zimní prázdniny..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="effective_from">Platí od</Label>
                    <Input
                      id="effective_from"
                      type="date"
                      value={seasonalForm.effective_from}
                      onChange={(e) => setSeasonalForm({ ...seasonalForm, effective_from: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="effective_until">Platí do</Label>
                    <Input
                      id="effective_until"
                      type="date"
                      value={seasonalForm.effective_until}
                      onChange={(e) => setSeasonalForm({ ...seasonalForm, effective_until: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Časové sloty</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                      <Plus size={14} className="mr-1" />
                      Přidat slot
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {seasonalForm.timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-end gap-2 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <Label className="text-xs">Den</Label>
                          <Select
                            value={String(slot.day_of_week)}
                            onValueChange={(value) => updateTimeSlot(index, "day_of_week", value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day.value} value={String(day.value)}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Od</Label>
                          <Input
                            type="time"
                            className="h-9 w-28"
                            value={slot.start_time}
                            onChange={(e) => updateTimeSlot(index, "start_time", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Do</Label>
                          <Input
                            type="time"
                            className="h-9 w-28"
                            value={slot.end_time}
                            onChange={(e) => updateTimeSlot(index, "end_time", e.target.value)}
                            required
                          />
                        </div>
                        {seasonalForm.timeSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2"
                            onClick={() => removeTimeSlot(index)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSeasonalDialogOpen(false);
                      resetSeasonalForm();
                    }}
                  >
                    Zrušit
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-gradient-gold">
                    {loading ? "Ukládám..." : editingSeasonalKey ? "Uložit" : "Přidat"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {seasonalGroups.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Žádná sezónní pravidla. Výchozí rozvrh platí po celý rok.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {seasonalGroups.map((group) => (
              <Card key={group.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sun size={18} className="text-amber-500" />
                        {group.schedule_name || "Bez názvu"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(group.effective_from + "T00:00:00"), "d. MMM yyyy", { locale: cs })}
                        {" — "}
                        {format(new Date(group.effective_until + "T00:00:00"), "d. MMM yyyy", { locale: cs })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditSeasonal(group)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSeasonal(group)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    {group.rows
                      .sort((a: any, b: any) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                      .map((row: any) => (
                        <div key={row.id} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="min-w-[70px] justify-center">
                            {getDayLabel(row.day_of_week)}
                          </Badge>
                          <Clock size={12} className="text-muted-foreground" />
                          <span>{row.start_time} - {row.end_time}</span>
                          {!row.is_active && (
                            <Badge variant="secondary" className="text-xs">Neaktivní</Badge>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ═══ 3. Blocked Dates ═══ */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-serif font-semibold">Blokované Dny</h3>
            <p className="text-muted-foreground">Zablokujte konkrétní dny, kdy nejste dostupní</p>
          </div>
          <Dialog open={blockedDialogOpen} onOpenChange={setBlockedDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setBlockedForm({ date: "", reason: "", is_full_day: true, start_time: "", end_time: "" })
                }
                className="bg-gradient-gold"
              >
                <Plus className="mr-2" size={16} />
                Blokovat Den
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Blokovat Den</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBlockedSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="blocked_date">Datum</Label>
                  <Input
                    id="blocked_date"
                    type="date"
                    value={blockedForm.date}
                    onChange={(e) => setBlockedForm({ ...blockedForm, date: e.target.value })}
                    required
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={blockedForm.is_full_day}
                    onCheckedChange={(checked) =>
                      setBlockedForm({ ...blockedForm, is_full_day: checked })
                    }
                  />
                  <Label>Celý den</Label>
                </div>

                {!blockedForm.is_full_day && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="blocked_start_time">Od</Label>
                      <Input
                        id="blocked_start_time"
                        type="time"
                        value={blockedForm.start_time}
                        onChange={(e) => setBlockedForm({ ...blockedForm, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="blocked_end_time">Do</Label>
                      <Input
                        id="blocked_end_time"
                        type="time"
                        value={blockedForm.end_time}
                        onChange={(e) => setBlockedForm({ ...blockedForm, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="blocked_reason">Důvod (volitelné)</Label>
                  <Textarea
                    id="blocked_reason"
                    value={blockedForm.reason}
                    onChange={(e) => setBlockedForm({ ...blockedForm, reason: e.target.value })}
                    placeholder="např. Dovolená, Nemoc, Konference..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setBlockedDialogOpen(false)}
                  >
                    Zrušit
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-gradient-gold">
                    {loading ? "Ukládám..." : "Blokovat"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {blockedDatesList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Žádné blokované dny</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Čas</TableHead>
                    <TableHead>Důvod</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedDatesList.map((blocked) => (
                    <TableRow key={blocked.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          {format(new Date(blocked.date), "d. MMMM yyyy", { locale: cs })}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {blocked.start_time && blocked.end_time ? (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {blocked.start_time.slice(0, 5)} – {blocked.end_time.slice(0, 5)}
                          </span>
                        ) : (
                          "Celý den"
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {blocked.reason || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBlocked(blocked.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAvailability;

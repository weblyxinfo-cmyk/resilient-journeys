import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Eye, Pencil, X, Search, Calendar, Clock, Euro, Filter } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

const SESSION_TYPE_NAMES: Record<string, string> = {
  discovery: "Discovery Call",
  one_on_one: "Individual Consultation",
  family: "Family Session",
  endometriosis_support: "Endometriosis & Chronic Pain Support",
  individual_eft_reiki_offer: "EFT Tapping & Reiki Session",
  premium_consultation: "Premium Consultation",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-orange-100 text-orange-800",
  no_show: "bg-purple-100 text-purple-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Čeká na platbu",
  confirmed: "Potvrzeno",
  scheduled: "Naplánováno",
  completed: "Dokončeno",
  cancelled: "Zrušeno",
  expired: "Expirováno",
  no_show: "Nedostavil se",
};

const AdminBookings = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    status: "",
    notes: "",
    booking_notes: "",
    cancellation_reason: "",
  });

  // Stats
  const [stats, setStats] = useState({
    totalThisMonth: 0,
    confirmed: 0,
    pendingPayment: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    calculateStats();
  }, [bookings]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("session_bookings")
        .select("*")
        .order("session_date", { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error: any) {
      toast.error("Chyba při načítání rezervací: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter (name or email)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.client_name?.toLowerCase().includes(search) ||
          b.client_email?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((b) => b.session_type === typeFilter);
    }

    setFilteredBookings(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const thisMonthBookings = bookings.filter((b) => {
      const bookingDate = new Date(b.session_date);
      return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
    });

    const confirmed = bookings.filter((b) => b.status === "confirmed").length;
    const pendingPayment = bookings.filter((b) => b.status === "pending_payment").length;

    const totalRevenue = bookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + (b.price_cents || 0), 0);

    setStats({
      totalThisMonth: thisMonthBookings.length,
      confirmed,
      pendingPayment,
      totalRevenue: totalRevenue / 100, // Convert cents to euros
    });
  };

  const handleView = (booking: any) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const handleEdit = (booking: any) => {
    setSelectedBooking(booking);
    setEditForm({
      status: booking.status,
      notes: booking.notes || "",
      booking_notes: booking.booking_notes || "",
      cancellation_reason: booking.cancellation_reason || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("session_bookings")
        .update({
          status: editForm.status,
          booking_notes: editForm.booking_notes,
          cancellation_reason: editForm.cancellation_reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      toast.success("Rezervace aktualizována");
      setEditDialogOpen(false);
      fetchBookings();
    } catch (error: any) {
      toast.error("Chyba při aktualizaci: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    const reason = prompt("Důvod zrušení (volitelné):");
    if (reason === null) return; // User clicked cancel

    setLoading(true);
    try {
      const { error } = await supabase
        .from("session_bookings")
        .update({
          status: "cancelled",
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) throw error;

      toast.success("Rezervace zrušena");
      fetchBookings();
    } catch (error: any) {
      toast.error("Chyba při rušení: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tento Měsíc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Potvrzené
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Čekající Platby
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayment}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Celkový Příjem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              €{stats.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Filtry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Hledat (jméno/email)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="search"
                  placeholder="Hledat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type-filter">Typ Sezení</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  {Object.entries(SESSION_TYPE_NAMES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Zobrazeno {filteredBookings.length} z {bookings.length} rezervací
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Zrušit filtry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Žádné rezervace</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum & Čas</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Calendar size={14} className="text-muted-foreground" />
                            {format(new Date(booking.session_date), "d. MMM yyyy", { locale: cs })}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            {format(new Date(booking.session_date), "HH:mm")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{booking.client_name}</span>
                          <span className="text-sm text-muted-foreground">{booking.client_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {SESSION_TYPE_NAMES[booking.session_type] || booking.session_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[booking.status]}>
                          {STATUS_LABELS[booking.status] || booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Euro size={14} className="text-muted-foreground" />
                          <span className="font-medium">
                            {booking.price_cents > 0
                              ? (booking.price_cents / 100).toFixed(2)
                              : "Zdarma"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(booking)}>
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(booking)}>
                            <Pencil size={16} />
                          </Button>
                          {booking.status !== "cancelled" && booking.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(booking.id)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Rezervace</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Klient</Label>
                  <p className="font-semibold">{selectedBooking.client_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-semibold">{selectedBooking.client_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Datum</Label>
                  <p className="font-semibold">
                    {format(new Date(selectedBooking.session_date), "d. MMMM yyyy", { locale: cs })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Čas</Label>
                  <p className="font-semibold">
                    {format(new Date(selectedBooking.session_date), "HH:mm")} (
                    {selectedBooking.duration_minutes} min)
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Typ</Label>
                  <p className="font-semibold">
                    {SESSION_TYPE_NAMES[selectedBooking.session_type] || selectedBooking.session_type}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={STATUS_COLORS[selectedBooking.status]}>
                    {STATUS_LABELS[selectedBooking.status] || selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cena</Label>
                  <p className="font-semibold">
                    {selectedBooking.price_cents > 0
                      ? `€${(selectedBooking.price_cents / 100).toFixed(2)}`
                      : "Zdarma"}
                  </p>
                </div>
                {selectedBooking.stripe_session_id && (
                  <div>
                    <Label className="text-muted-foreground">Stripe ID</Label>
                    <p className="text-sm font-mono truncate">{selectedBooking.stripe_session_id}</p>
                  </div>
                )}
              </div>

              {selectedBooking.notes && (
                <div>
                  <Label className="text-muted-foreground">Poznámka klienta</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg mt-1">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.booking_notes && (
                <div>
                  <Label className="text-muted-foreground">Interní poznámky</Label>
                  <p className="text-sm bg-muted p-3 rounded-lg mt-1">{selectedBooking.booking_notes}</p>
                </div>
              )}

              {selectedBooking.cancellation_reason && (
                <div>
                  <Label className="text-muted-foreground">Důvod zrušení</Label>
                  <p className="text-sm bg-red-50 p-3 rounded-lg mt-1">
                    {selectedBooking.cancellation_reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upravit Rezervaci</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-booking-notes">Interní Poznámky</Label>
                <Textarea
                  id="edit-booking-notes"
                  value={editForm.booking_notes}
                  onChange={(e) => setEditForm({ ...editForm, booking_notes: e.target.value })}
                  placeholder="Poznámky viditelné pouze pro admin..."
                  rows={3}
                />
              </div>

              {editForm.status === "cancelled" && (
                <div>
                  <Label htmlFor="edit-cancel-reason">Důvod Zrušení</Label>
                  <Textarea
                    id="edit-cancel-reason"
                    value={editForm.cancellation_reason}
                    onChange={(e) => setEditForm({ ...editForm, cancellation_reason: e.target.value })}
                    placeholder="Proč byla rezervace zrušena..."
                    rows={2}
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-gold">
                  {loading ? "Ukládám..." : "Uložit Změny"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBookings;

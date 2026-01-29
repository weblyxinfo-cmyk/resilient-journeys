import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Eye, MessageSquare, UserCheck } from "lucide-react";
import { format } from "date-fns";

interface Inquiry {
  id: string;
  workshop_id: string | null;
  name: string;
  email: string;
  company: string | null;
  group_size: string | null;
  message: string;
  created_at: string;
  workshop_title?: string;
}

interface Registration {
  id: string;
  workshop_id: string;
  name: string;
  email: string;
  phone: string | null;
  note: string | null;
  status: string;
  created_at: string;
  workshop_title?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  paid: "Paid",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminInquiries = () => {
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewRegDialogOpen, setViewRegDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    fetchInquiries();
    fetchRegistrations();
  }, []);

  const fetchWorkshopMap = async (ids: string[]) => {
    if (ids.length === 0) return {};
    const { data: workshops } = await supabase
      .from("blog_posts")
      .select("id, title")
      .in("id", ids);
    return workshops
      ? Object.fromEntries(workshops.map((w) => [w.id, w.title]))
      : {};
  };

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workshop_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const workshopIds = (data || [])
        .map((i) => i.workshop_id)
        .filter((id): id is string => id !== null);
      const workshopMap = await fetchWorkshopMap(workshopIds);

      setInquiries(
        (data || []).map((inquiry) => ({
          ...inquiry,
          workshop_title: inquiry.workshop_id ? workshopMap[inquiry.workshop_id] : undefined,
        }))
      );
    } catch (error: any) {
      toast.error("Error loading inquiries: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("workshop_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const workshopIds = (data || []).map((r) => r.workshop_id);
      const workshopMap = await fetchWorkshopMap([...new Set(workshopIds)]);

      setRegistrations(
        (data || []).map((reg) => ({
          ...reg,
          workshop_title: workshopMap[reg.workshop_id],
        }))
      );
    } catch (error: any) {
      toast.error("Error loading registrations: " + error.message);
    }
  };

  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("workshop_registrations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      toast.success("Status updated");
      fetchRegistrations();
      if (selectedRegistration?.id === id) {
        setSelectedRegistration({ ...selectedRegistration, status });
      }
    } catch (error: any) {
      toast.error("Error updating status: " + error.message);
    }
  };

  const filteredInquiries = searchTerm
    ? inquiries.filter((i) => {
        const s = searchTerm.toLowerCase();
        return (
          i.name.toLowerCase().includes(s) ||
          i.email.toLowerCase().includes(s) ||
          (i.company && i.company.toLowerCase().includes(s)) ||
          (i.workshop_title && i.workshop_title.toLowerCase().includes(s))
        );
      })
    : inquiries;

  const filteredRegistrations = searchTerm
    ? registrations.filter((r) => {
        const s = searchTerm.toLowerCase();
        return (
          r.name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          (r.workshop_title && r.workshop_title.toLowerCase().includes(s))
        );
      })
    : registrations;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {registrations.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm">
            <Label htmlFor="inquiry-search">Search (name, email, workshop)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input
                id="inquiry-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="registrations">
        <TabsList className="bg-cream/50">
          <TabsTrigger value="registrations">
            <UserCheck className="h-4 w-4 mr-2" />
            Registrations ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="inquiries">
            <MessageSquare className="h-4 w-4 mr-2" />
            Inquiries ({inquiries.length})
          </TabsTrigger>
        </TabsList>

        {/* Registrations Tab */}
        <TabsContent value="registrations">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">No registrations yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Workshop</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(reg.created_at), "d MMM yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">{reg.name}</TableCell>
                          <TableCell>{reg.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{reg.workshop_title || "—"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[reg.status] || "bg-gray-100 text-gray-800"}>
                              {STATUS_LABELS[reg.status] || reg.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Select
                                value={reg.status}
                                onValueChange={(val) => updateRegistrationStatus(reg.id, val)}
                              >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRegistration(reg);
                                  setViewRegDialogOpen(true);
                                }}
                              >
                                <Eye size={16} />
                              </Button>
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
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                </div>
              ) : filteredInquiries.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  {inquiries.length === 0 ? "No inquiries yet" : "No matching inquiries"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Workshop</TableHead>
                        <TableHead>Group Size</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(inquiry.created_at), "d MMM yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>{inquiry.email}</TableCell>
                          <TableCell>{inquiry.company || "—"}</TableCell>
                          <TableCell>
                            {inquiry.workshop_title ? (
                              <Badge variant="outline">{inquiry.workshop_title}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">General</span>
                            )}
                          </TableCell>
                          <TableCell>{inquiry.group_size || "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inquiry Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-semibold">{selectedInquiry.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-semibold">
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline">
                      {selectedInquiry.email}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Company</Label>
                  <p className="font-semibold">{selectedInquiry.company || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Group Size</Label>
                  <p className="font-semibold">{selectedInquiry.group_size || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Workshop</Label>
                  <p className="font-semibold">{selectedInquiry.workshop_title || "General Inquiry"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-semibold">
                    {format(new Date(selectedInquiry.created_at), "d MMMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Message</Label>
                <p className="text-sm bg-muted p-4 rounded-lg mt-1 whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Registration Detail Dialog */}
      <Dialog open={viewRegDialogOpen} onOpenChange={setViewRegDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-semibold">{selectedRegistration.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-semibold">
                    <a href={`mailto:${selectedRegistration.email}`} className="text-primary hover:underline">
                      {selectedRegistration.email}
                    </a>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-semibold">{selectedRegistration.phone || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Workshop</Label>
                  <p className="font-semibold">{selectedRegistration.workshop_title || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={STATUS_COLORS[selectedRegistration.status] || "bg-gray-100"}>
                    {STATUS_LABELS[selectedRegistration.status] || selectedRegistration.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-semibold">
                    {format(new Date(selectedRegistration.created_at), "d MMMM yyyy, HH:mm")}
                  </p>
                </div>
              </div>
              {selectedRegistration.note && (
                <div>
                  <Label className="text-muted-foreground">Note</Label>
                  <p className="text-sm bg-muted p-4 rounded-lg mt-1 whitespace-pre-wrap">
                    {selectedRegistration.note}
                  </p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Select
                  value={selectedRegistration.status}
                  onValueChange={(val) => updateRegistrationStatus(selectedRegistration.id, val)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInquiries;

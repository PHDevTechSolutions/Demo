"use client";

import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { IoSearchOutline, IoFilter } from "react-icons/io5";
import Form from "./Form";

/* shadcn/ui components (assumed available at these paths) */
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

interface Note {
    id: number;
    activitynumber: string;
    referenceid: string;
    manager: string;
    tsm: string;
    activitystatus: string;
    typeactivity: string;
    remarks: string;
    startdate: string;
    enddate: string;
    date_created: string;
    date_updated?: string;
}

interface UserDetails {
    ReferenceID: string;
    Firstname: string;
    Lastname: string;
    Manager: string;
    TSM: string;
    Role: string;
    [key: string]: any;
}

interface NotesProps {
    posts?: Note[];
    userDetails: UserDetails;
}

const ITEMS_PER_PAGE = 10;

const Notes: React.FC<NotesProps> = ({ posts = [], userDetails }) => {
    const [notes, setNotes] = useState<Note[]>(posts);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // delete dialog
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    // filter dialog
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    // filters / form state
    const [activitystatus, setActivityStatus] = useState("");
    const [typeactivity, setTypeActivity] = useState("");
    const [remarks, setRemarks] = useState("");
    const [startdate, setStartDate] = useState("");
    const [enddate, setEndDate] = useState("");

    // search / inline filter
    const [showSearch, setShowSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All");

    const getBadgeClasses = (status: string) => {
        switch (status) {
            case "Completed":
                return "success";  // assuming shadcn badge has this variant
            case "Pending":
                return "warning";
            case "In Progress":
                return "primary";
            default:
                return "default";
        }
    };
    const activityTypes = [
        "Assisting Other Agent Clients",
        "Coordination of SO To Warehouse",
        "Coordination of SO to Orders",
        "Updating Reports",
        "Check/Read emails",
        "Documentation",
    ];

    // safe localStorage writer
    const safeSetItem = (key: string, value: string) => {
        try {
            localStorage.setItem(key, value);
        } catch (e: any) {
            if (e?.name === "QuotaExceededError" || e?.code === 22) {
                const noteKeys = Object.keys(localStorage).filter((k) => k.startsWith("notes_"));
                if (noteKeys.length > 0) {
                    localStorage.removeItem(noteKeys[0]);
                    try {
                        localStorage.setItem(key, value);
                    } catch {
                        console.error("Still cannot save notes after cleanup.");
                    }
                }
            } else {
                console.error("LocalStorage error:", e);
            }
        }
    };

    const syncToCache = (newNotes: Note[]) => {
        setNotes(newNotes);
        safeSetItem(`notes_${userDetails.ReferenceID}`, JSON.stringify(newNotes));
    };

    useEffect(() => {
        const cached = localStorage.getItem(`notes_${userDetails.ReferenceID}`);
        if (cached) setNotes(JSON.parse(cached));

        const fetchNotes = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ModuleSales/Task/Notes/Fetch?referenceid=${userDetails.ReferenceID}`);
                if (!res.ok) throw new Error("Failed to fetch notes");
                const data = await res.json();
                if (data.success && data.data) {
                    setNotes(data.data);
                    safeSetItem(`notes_${userDetails.ReferenceID}`, JSON.stringify(data.data));
                }
            } catch (err) {
                toast.error("Error fetching notes");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userDetails.ReferenceID]);

    const generateActivityNumber = () => `ACT-${Date.now()}`;

    const resetForm = () => {
        setEditingId(null);
        setActivityStatus("");
        setTypeActivity("");
        setRemarks("");
        setStartDate("");
        setEndDate("");
    };

    const handleSubmit = async () => {
        if (!activitystatus || !typeactivity || !startdate || !enddate) {
            toast.warning("Please fill all required fields!");
            return;
        }

        const activityNumber = editingId
            ? notes.find((n) => n.id === editingId)?.activitynumber || generateActivityNumber()
            : generateActivityNumber();

        const payload: Note = {
            id: editingId || Date.now(),
            activitynumber: activityNumber,
            referenceid: userDetails.ReferenceID,
            manager: userDetails.Manager,
            tsm: userDetails.TSM,
            activitystatus,
            typeactivity,
            remarks,
            startdate,
            enddate,
            date_created: new Date().toISOString(),
            date_updated: new Date().toISOString(),
        };

        // optimistic local update + cache
        syncToCache([payload, ...notes.filter((n) => n.id !== payload.id)]);

        try {
            const url = editingId ? "/api/ModuleSales/Task/Notes/Edit" : "/api/ModuleSales/Task/Notes";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to submit activity");

            await res.json();
            resetForm();
            toast.success(editingId ? "Activity updated!" : "Activity submitted successfully!");
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong!");
            console.error(err);
        }
    };

    const handleEdit = (note: Note) => {
        setEditingId(note.id);
        setActivityStatus(note.activitystatus);
        setTypeActivity(note.typeactivity);
        setRemarks(note.remarks);
        setStartDate(formatForInput(note.startdate));
        setEndDate(formatForInput(note.enddate));
        // scroll into view or focus form if desired
    };

    const handleDelete = async (id: number) => {
        setDeleteOpen(false);
        syncToCache(notes.filter((n) => n.id !== id));

        try {
            const res = await fetch("/api/ModuleSales/Task/DailyActivity/DeleteProgress", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) throw new Error("Failed to delete activity");
            await res.json();
            toast.success("Activity deleted successfully!");
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong while deleting!");
            console.error(err);
        }
    };

    // Filtering pipeline
    const filteredNotes = notes
        // only show notes within the allowed types
        .filter((note) => activityTypes.includes(note.typeactivity))
        // apply dropdown filter
        .filter((note) => filterType === "All" || note.typeactivity === filterType)
        // apply search
        .filter(
            (note) =>
                note.typeactivity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.remarks.toLowerCase().includes(searchTerm.toLowerCase())
        )
        // apply user role visibility
        .filter(
            (note) =>
                userDetails.Role === "Super Admin" || note.referenceid === userDetails.ReferenceID
        );

    const formatRelativeDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays === 2) return "Last 2 Days";
        if (diffDays === 3) return "Last 3 Days";
        return date.toLocaleDateString();
    };

    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
            date.getHours()
        )}:${pad(date.getMinutes())}`;
    };

    return (
        <div className="w-full bg-white">
            <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-black">Notes</h2>

                <div className="flex gap-3 items-center">
                    {/* Search toggle + input */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowSearch((s) => !s)}
                            aria-label="Toggle search"
                            title="Search"
                        >
                            <IoSearchOutline />
                        </Button>
                        {showSearch && (
                            <Input
                                aria-label="Search notes"
                                placeholder="Search by remarks or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="text-xs w-[220px]"
                            />
                        )}
                    </div>

                    {/* Inline Filter Select */}
                    <div className="flex items-center gap-2">
                        <Select onValueChange={(v) => setFilterType(v)} value={filterType}>
                            <SelectTrigger className="w-[180px] text-xs">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                <SelectGroup>
                                    <SelectItem value="All">All Types</SelectItem>
                                    {activityTypes.map((t, i) => (
                                        <SelectItem key={i} value={t}>
                                            {t}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {/* Filter Dialog (advanced) */}
                        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" aria-label="Open filters">
                                    <IoFilter />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Advanced Filters</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-3 py-2">
                                    <div>
                                        <label className="block text-xs font-medium mb-1">Type</label>
                                        <Select onValueChange={(v) => setFilterType(v)} value={filterType}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="All Types" />
                                            </SelectTrigger>
                                            <SelectContent className="text-xs">
                                                <SelectGroup>
                                                    <SelectItem value="All">All Types</SelectItem>
                                                    {activityTypes.map((t, i) => (
                                                        <SelectItem key={i} value={t}>
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1">Search</label>
                                        <Input
                                            placeholder="Search remarks or type..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <div className="flex w-full justify-end gap-2">
                                        <Button variant="ghost" onClick={() => { setFilterType("All"); setSearchTerm(""); }}>
                                            Reset
                                        </Button>
                                        <Button onClick={() => setFilterDialogOpen(false)}>Apply</Button>
                                    </div>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-500 px-4 mb-4">
                This section allows you to track, manage, and update your daily activities.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 border-t gap-4 p-3">
                {/* Left Column: Notes list */}
                <div className="col-span-1 space-y-2 ">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Spinner />
                                <div className="w-full">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-[80%] mt-2" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-2">
                            {filteredNotes.length === 0 && (
                                <div className="text-gray-400 text-center text-xs italic py-4">No notes yet</div>
                            )}

                            {filteredNotes
                                .slice(0, visibleCount)
                                .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
                                .map((note) => (
                                    <Card
                                        key={note.id}
                                        className={`cursor-pointer transition hover:shadow-md ${editingId === note.id ? "bg-orange-50" : "bg-white"
                                            }`}
                                        onClick={() => handleEdit(note)}
                                    >
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-sm font-semibold">{note.typeactivity}</CardTitle>
                                            <CardDescription className="text-xs text-gray-500 line-clamp-2">
                                                {note.remarks.length > 120 ? note.remarks.slice(0, 120) + "..." : note.remarks}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="p-3 pt-0 flex items-center justify-between">
                                            <div>

                                                <Badge className={`inline-block text-[10px] font-medium rounded-full px-2 py-1 ${getBadgeClasses(note.activitystatus)}`}>
                                                    {note.activitystatus}
                                                </Badge>


                                                <div className="text-[11px] text-gray-400 italic mt-2">{formatRelativeDate(note.date_created)}</div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <Dialog open={deleteOpen && deleteTargetId === note.id} onOpenChange={(v) => { if (!v) setDeleteTargetId(null); setDeleteOpen(v); }}>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); setDeleteTargetId(note.id); setDeleteOpen(true); }}
                                                            aria-label="Delete note"
                                                            title="Delete"
                                                            className="border-red-400 text-red-500 hover:bg-red-50"
                                                        >
                                                            <AiOutlineDelete />
                                                        </Button>
                                                    </DialogTrigger>

                                                    <DialogContent
                                                        className="z-[9999] relative bg-white rounded-lg shadow-2xl border border-gray-200"
                                                        style={{ position: "fixed" }} // ensures it stays above other fixed layers
                                                    >
                                                        <DialogHeader>
                                                            <DialogTitle>Confirm Delete</DialogTitle>
                                                        </DialogHeader>

                                                        <div className="py-2 text-sm text-gray-700">
                                                            Are you sure you want to delete this note? This action cannot be undone.
                                                        </div>

                                                        <DialogFooter>
                                                            <div className="flex w-full justify-end gap-2">
                                                                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        deleteTargetId && handleDelete(deleteTargetId);
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                            {visibleCount < filteredNotes.length && (
                                <div className="flex justify-center mt-2">
                                    <Button variant="outline" className="w-full text-xs" onClick={() => setVisibleCount((p) => p + ITEMS_PER_PAGE)}>
                                        View More
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Form */}
                <div className="col-span-3">
                    <Form
                        editingId={editingId}
                        activitystatus={activitystatus}
                        typeactivity={typeactivity}
                        remarks={remarks}
                        startdate={startdate}
                        enddate={enddate}
                        activityTypes={activityTypes}
                        setActivityStatus={setActivityStatus}
                        setTypeActivity={setTypeActivity}
                        setRemarks={setRemarks}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        handleSubmit={handleSubmit}
                        resetForm={resetForm}
                        dateUpdated={editingId ? notes.find((n) => n.id === editingId)?.date_updated || "" : ""}
                    />
                </div>
            </div>
        </div>
    );
};

export default Notes;

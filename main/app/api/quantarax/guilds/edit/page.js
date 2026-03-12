'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Save,
    Trash2,
    TrendingUp,
    ChevronLeft,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Edit3,
    ArrowLeft,
    CloudUpload,
    FileIcon,
    LinkIcon
} from 'lucide-react';

export default function GuildsDashboard() {
    const [guilds, setGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);

    // Upload state
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadFilename, setUploadFilename] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchGuilds();
    }, []);

    const fetchGuilds = async () => {
        try {
            const res = await fetch('/api/quantarax/guilds');
            const data = await res.json();
            const formatted = (Array.isArray(data) ? data : []).map(g => ({
                ...g,
                guildDescription: g.guildDescription || '',
                guildProgressReport: g.guildProgressReport || '',
                guildFiles: g.guildFiles || [],
                guildMembers: (g.guildMembers || []).map(m =>
                    typeof m === 'string' ? { name: m, role: 'Member' } : m
                )
            }));
            setGuilds(formatted);
        } catch (error) {
            console.error('Failed to fetch guilds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const password = prompt("Enter system password to push changes:");
        if (!password) return;

        setSaving(true);
        setStatus(null);
        try {
            const res = await fetch('/api/quantarax/guilds/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify(guilds),
            });
            if (res.ok) {
                setStatus('success');
                setTimeout(() => setStatus(null), 2000);
            } else {
                const data = await res.json();
                setStatus('error');
                alert(data.error || 'Failed to save');
            }
        } catch (error) {
            setStatus('error');
            alert('Connection error');
        } finally {
            setSaving(false);
        }
    };


    const handleUpload = async (index) => {
        if (!selectedFile || !uploadFilename.trim()) return;

        const password = prompt("System password for upload authorization:");
        if (!password) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('filename', uploadFilename.trim());

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/quantarax/guilds/upload', true);
        xhr.setRequestHeader('Authorization', password);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percent);
            }
        };

        xhr.onload = () => {
            const data = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                const newFile = { name: uploadFilename.trim(), url: data.url };
                const updatedGuilds = [...guilds];
                const guild = updatedGuilds[index];

                guild.guildFiles = [...(guild.guildFiles || []), newFile];

                setGuilds(updatedGuilds);
                setSelectedFile(null);
                setUploadFilename('');
                setUploadProgress(0);
                setUploading(false);
                alert("File uploaded!");
            } else {
                setUploading(false);
                setUploadProgress(0);
                alert(data.error || "Upload failed");
            }
        };

        xhr.onerror = () => {
            setUploading(false);
            setUploadProgress(0);
            alert("Connection error during upload");
        };

        xhr.send(formData);
    };

    const handleDeleteFile = async (guildIndex, fileIndex) => {
        const file = guilds[guildIndex].guildFiles[fileIndex];
        if (!confirm(`Delete ${file.name} permanently?`)) return;

        const password = prompt("System password for deletion:");
        if (!password) return;

        try {
            const res = await fetch(`/api/quantarax/guilds/upload?filename=${encodeURIComponent(file.name)}`, {
                method: 'DELETE',
                headers: { 'Authorization': password }
            });
            const data = await res.json();
            if (res.ok) {
                const updatedGuilds = [...guilds];
                updatedGuilds[guildIndex].guildFiles.splice(fileIndex, 1);
                setGuilds(updatedGuilds);
            } else {
                alert(data.error || "Delete failed");
            }
        } catch (error) {
            alert("Error deleting file");
        }
    };

    const handleRenameFile = async (guildIndex, fileIndex) => {
        const file = guilds[guildIndex].guildFiles[fileIndex];
        const newName = prompt("Enter new filename:", file.name);
        if (!newName || newName === file.name) return;

        const password = prompt("System password for renaming:");
        if (!password) return;

        try {
            const res = await fetch('/api/quantarax/guilds/upload', {
                method: 'PATCH',
                headers: {
                    'Authorization': password,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oldFilename: file.name, newFilename: newName })
            });
            const data = await res.json();
            if (res.ok) {
                const updatedGuilds = [...guilds];
                updatedGuilds[guildIndex].guildFiles[fileIndex] = { name: newName, url: data.url };

                // Update link in report if it exists
                const oldLink = `[File: ${file.name}](${file.url})`;
                const newLink = `[File: ${newName}](${data.url})`;
                if (updatedGuilds[guildIndex].guildProgressReport.includes(oldLink)) {
                    updatedGuilds[guildIndex].guildProgressReport = updatedGuilds[guildIndex].guildProgressReport.replace(oldLink, newLink);
                }

                setGuilds(updatedGuilds);
            } else {
                alert(data.error || "Rename failed");
            }
        } catch (error) {
            alert("Error renaming file");
        }
    };

    const addGuild = () => {
        const newGuild = {
            guildName: 'New Guild',
            guildDescription: '',
            guildMembers: [],
            guildProgress: 0,
            guildProgressReport: '',
            guildFiles: []
        };
        setGuilds([...guilds, newGuild]);
        setEditingIndex(guilds.length);
    };

    const deleteGuild = (index) => {
        if (confirm('Delete this guild?')) {
            const newGuilds = [...guilds];
            newGuilds.splice(index, 1);
            setGuilds(newGuilds);
            if (editingIndex === index) setEditingIndex(null);
        }
    };

    const updateGuild = (index, field, value) => {
        const newGuilds = [...guilds];
        newGuilds[index] = { ...newGuilds[index], [field]: value };
        setGuilds(newGuilds);
    };

    const addMember = (index, memberName) => {
        if (!memberName.trim()) return;
        const role = prompt("Enter role for this member:", "Member");
        if (role === null) return;

        const newMembers = [...guilds[index].guildMembers, { name: memberName.trim(), role }];
        updateGuild(index, 'guildMembers', newMembers);
    };

    const updateMemberRole = (guildIndex, memberIndex) => {
        const member = guilds[guildIndex].guildMembers[memberIndex];
        const newRole = prompt(`Update role for ${member.name}:`, member.role);
        if (newRole === null || newRole === member.role) return;

        const newMembers = [...guilds[guildIndex].guildMembers];
        newMembers[memberIndex] = { ...member, role: newRole };
        updateGuild(guildIndex, 'guildMembers', newMembers);
    };

    const removeMember = (guildIndex, memberIndex) => {
        const newMembers = [...guilds[guildIndex].guildMembers];
        newMembers.splice(memberIndex, 1);
        updateGuild(guildIndex, 'guildMembers', newMembers);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans selection:bg-white/10">
            <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
                {/* Minimal Header */}
                <header className="flex items-center justify-between mb-3 pb-6 border-b border-zinc-900">
                    <div className={editingIndex !== null ? 'hidden sm:block' : 'block'}>
                        <h1 className="text-xl font-semibold text-white">Guilds</h1>
                        <p className="text-sm text-zinc-500">System Dashboard</p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {editingIndex !== null && (
                            <button
                                onClick={() => setEditingIndex(null)}
                                className="sm:hidden p-2 text-zinc-500 hover:text-white transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={addGuild}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-sm font-medium transition active:scale-95 border border-zinc-800"
                        >
                            <Plus className="w-4 h-4" />
                            New Guild
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving' : 'Save'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    {/* List */}
                    <div className={`md:col-span-5 space-y-2 ${editingIndex !== null ? 'hidden md:block' : 'block'}`}>
                        {guilds.map((guild, index) => (
                            <div
                                key={index}
                                onClick={() => setEditingIndex(index)}
                                className={`group cursor-pointer p-3.5 rounded-xl border transition-all ${editingIndex === index
                                    ? 'bg-zinc-900 border-zinc-700'
                                    : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={`font-medium text-sm transition ${editingIndex === index ? 'text-white' : 'text-zinc-400'}`}>
                                        {guild.guildName}
                                    </h3>
                                    <span className="text-[10px] font-mono text-zinc-600">{guild.guildProgress}% Done</span>
                                </div>
                                <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${guild.guildProgress}%` }}
                                        className={`h-full transition-all duration-500 ${editingIndex === index ? 'bg-white' : 'bg-zinc-700 group-hover:bg-zinc-500'}`}
                                    />
                                </div>
                            </div>
                        ))}

                        {guilds.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-zinc-900 rounded-2xl">
                                <p className="text-xs text-zinc-600 italic">No active guilds.</p>
                            </div>
                        )}
                    </div>

                    {/* Editor */}
                    <div className={`md:col-span-7 ${editingIndex === null ? 'hidden md:block' : 'block'}`}>
                        <AnimatePresence mode="wait">
                            {editingIndex !== null ? (
                                <motion.div
                                    key={editingIndex}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="space-y-8"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Edit3 className="w-4 h-4 text-zinc-500" />
                                            <h2 className="text-sm font-medium text-white">{guilds[editingIndex].guildName}</h2>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEditingIndex(null)}
                                                className="p-1 text-zinc-600 hover:text-zinc-500 transition"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteGuild(editingIndex)}
                                                className="p-1 text-zinc-600 hover:text-red-500 transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button></div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 ml-1">Guild Name</label>
                                            <input
                                                type="text"
                                                value={guilds[editingIndex].guildName}
                                                onChange={(e) => updateGuild(editingIndex, 'guildName', e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600 transition text-white text-sm"
                                                placeholder="Guild name..."
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 ml-1">Core Description</label>
                                            <input
                                                type="text"
                                                value={guilds[editingIndex].guildDescription}
                                                onChange={(e) => updateGuild(editingIndex, 'guildDescription', e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-zinc-600 transition text-zinc-300 text-xs"
                                                placeholder="Brief guild summary..."
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex justify-between ml-1">
                                                <label className="text-[10px] font-bold text-zinc-500">Progress</label>
                                                <span className="text-[10px] font-mono text-zinc-400">{guilds[editingIndex].guildProgress}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={guilds[editingIndex].guildProgress}
                                                onChange={(e) => updateGuild(editingIndex, 'guildProgress', parseInt(e.target.value))}
                                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 ml-1">Members</label>
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                {guilds[editingIndex].guildMembers.map((member, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-zinc-300 group">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-white leading-tight">{member.name}</span>
                                                            <span className="text-[9px] text-zinc-500 uppercase cursor-pointer hover:text-cyan-400 transition" onClick={() => updateMemberRole(editingIndex, i)}>{member.role}</span>
                                                        </div>
                                                        <button onClick={() => removeMember(editingIndex, i)} className="text-zinc-600 hover:text-red-500 transition ml-1">
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-1.5">
                                                <input
                                                    id="memberInput"
                                                    type="text"
                                                    placeholder="Assign user..."
                                                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 transition"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addMember(editingIndex, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const el = document.getElementById('memberInput');
                                                        addMember(editingIndex, el.value);
                                                        el.value = '';
                                                    }}
                                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg transition"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 ml-1">Progress Report</label>
                                            <textarea
                                                value={guilds[editingIndex].guildProgressReport}
                                                onChange={(e) => updateGuild(editingIndex, 'guildProgressReport', e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 h-48 focus:outline-none focus:border-zinc-600 transition resize-none text-xs leading-relaxed text-zinc-300 font-mono"
                                                placeholder="Enter progress log..."
                                            />
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-zinc-900">
                                            <div className="flex items-center gap-2">
                                                <CloudUpload className="w-4 h-4 text-zinc-500" />
                                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Attachments</label>
                                            </div>

                                            {/* Existing Files */}
                                            <div className="space-y-2">
                                                {(guilds[editingIndex].guildFiles || []).map((file, i) => (
                                                    <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg group hover:border-zinc-700 transition">
                                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                            <FileIcon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                                                            <span className="text-[11px] text-zinc-300 truncate font-medium">{file.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition px-1">
                                                            <button onClick={() => handleRenameFile(editingIndex, i)} className="p-1.5 text-zinc-600 hover:text-white transition" title="Rename">
                                                                <Edit3 className="w-3 h-3" />
                                                            </button>
                                                            <button onClick={() => handleDeleteFile(editingIndex, i)} className="p-1.5 text-zinc-600 hover:text-red-500 transition" title="Delete">
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-zinc-500 hover:text-cyan-400 transition" title="Open Link">
                                                                <LinkIcon className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Upload Form */}
                                            <div className="bg-zinc-900/10 border border-zinc-800 border-dashed rounded-xl p-4 space-y-3">
                                                <div className="grid grid-cols-1 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Custom filename (e.g. schematic.pdf)"
                                                        value={uploadFilename}
                                                        onChange={(e) => setUploadFilename(e.target.value)}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 font-mono"
                                                    />
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="file"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        setSelectedFile(file);
                                                                        if (!uploadFilename) setUploadFilename(file.name);
                                                                    }
                                                                }}
                                                                className="flex-1 text-[10px] text-zinc-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 transition cursor-pointer"
                                                            />
                                                            <button
                                                                onClick={() => handleUpload(editingIndex)}
                                                                disabled={uploading || !selectedFile || !uploadFilename}
                                                                className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black text-[10px] font-bold rounded-md transition disabled:opacity-50 min-w-[70px]"
                                                            >
                                                                {uploading ? `${uploadProgress}%` : "Upload"}
                                                            </button>
                                                        </div>
                                                        {uploading && (
                                                            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${uploadProgress}%` }}
                                                                    className="h-full bg-white transition-all duration-300"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-zinc-900 rounded-2xl bg-zinc-900/10">
                                    <TrendingUp className="w-8 h-8 text-zinc-800 mb-3" />
                                    <p className="text-xs text-zinc-600">Select entry to modify</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Notification */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl border bg-zinc-900 ${status === 'success' ? 'border-zinc-800 text-white' : 'border-red-900 text-red-400'
                            }`}>
                            {status === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4" />}
                            <span className="text-xs font-medium">{status === 'success' ? 'Synchronized' : 'Sync Failed'}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                body {
                    background-color: #09090b;
                    -webkit-font-smoothing: antialiased;
                }
                
                ::-webkit-scrollbar {
                    width: 4px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
                
                input[type=range]::-webkit-slider-thumb {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    -webkit-appearance: none;
                }
            `}</style>
        </div>
    );
}

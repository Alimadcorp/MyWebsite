"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function Client() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    submissions: 0,
    has_laptop: 0,
    has_experience: 0,
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const r = await fetch("/api/members");
        const d = await r.json();
        setMembers(d.data);
        setStats({
          submissions: d.submissions,
          has_laptop: d.has_laptop,
          has_experience: d.has_experience,
        });
      } catch (e) {
        console.error("Failed to fetch members:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Loading...
      </div>
    );

  return (
    <main className="min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-1">Club Members</h1>
          <p className="text-muted-foreground">
            Manage and view all club members information
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-sm mb-1">Total Members</div>
            <div className="text-3xl font-bold">{stats.submissions}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm mb-1">Have Laptop</div>
            <div className="text-3xl font-bold">{stats.has_laptop}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm mb-1">Have Experience</div>
            <div className="text-3xl font-bold">{stats.has_experience}</div>
          </Card>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roll</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Learning</TableHead>
                <TableHead>Laptop</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {m.first_name} {m.last_name}
                  </TableCell>
                  <TableCell>{m.phone}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.roll || "-"}</TableCell>
                  <TableCell
                    className="px-2 py-1 rounded text-white"
                    style={{
                      fontWeight: (() => {
                        const age = Math.floor(
                          (Date.now() - new Date(m.dob)) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        );
                        return age > 18 ? "700" : "400";
                      })(),
                      color: (() => {
                        const age = Math.floor(
                          (Date.now() - new Date(m.dob)) /
                            (365.25 * 24 * 60 * 60 * 1000)
                        );
                        if (age <= 13) return "#16a34a";
                        if (age <= 18) return "#000";
                        return "#f00";
                      })(),
                    }}
                  >
                    {new Date(m.dob).toDateString().split(' ').slice(1, 4).join(' ')}
                  </TableCell>
                  <TableCell>{m.learn.replace("Development", "Dev")}</TableCell>
                  <TableCell>
                    {m.laptop ? <strong>Yes</strong> : "No"}
                  </TableCell>
                  <TableCell>
                    {m.experience ? <strong>Yes</strong> : "No"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/members/${m.email.split("@")[0]}`}>
                      <Button size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}

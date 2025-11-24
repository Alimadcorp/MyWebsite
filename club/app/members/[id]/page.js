"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Check } from "lucide-react"

export default function MemberDetailPage({ params }) {
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members")
        const data = await response.json()
        const { id } = await params;

        const foundMember = data.data.find((m) => {
          const memberSlug = `${m.email.split('@')[0]}`
          return memberSlug === id
        })

        setMember(foundMember || null)
      } catch (error) {
        console.error("Failed to fetch member:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [params.id])

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const calculateAge = (dob) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">Loading member details...</div>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Members
            </Button>
          </Link>
          <Card className="p-8 text-center">
            <p className="text-lg text-muted-foreground">Member not found</p>
          </Card>
        </div>
      </div>
    )
  }

  const age = calculateAge(member.dob)
  const joiningDate = new Date(member.startedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const submissionDate = new Date(member.submissionTime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const timeTakenMinutes = Math.round(member.timeTaken / 60000)
  const timeTakenHours = Math.floor(timeTakenMinutes / 60)
  const timeTakenMins = timeTakenMinutes % 60

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Members
          </Button>
        </Link>

        {/* Main Card */}
        <Card className="p-8 bg-card border-border">
          {/* Header */}
          <div className="mb-8 border-b border-border pb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {member.first_name} {member.last_name}
            </h1>
            <p className="text-muted-foreground">{member.learn}</p>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <div className="flex gap-2 items-center">
                    <span className="font-medium text-foreground">{member.email}</span>
                    <Button onClick={() => copyToClipboard(member.email, "email")} variant="ghost" size="sm">
                      {copiedField === "email" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Phone:</span>
                  <div className="flex gap-2 items-center">
                    <span className="font-medium text-foreground">{member.phone}</span>
                    <Button onClick={() => copyToClipboard(member.phone, "phone")} variant="ghost" size="sm">
                      {copiedField === "phone" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="font-medium text-foreground">{member.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-medium text-foreground">{age} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roll Number:</span>
                  <span className="font-medium text-foreground">{member.roll || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-8 p-4 bg-secondary rounded-lg">
            <h3 className="text-lg font-semibold text-secondary-foreground mb-3">Status</h3>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-foreground">Laptop:</span>
                <span className={`font-semibold ${member.laptop ? "text-green-600" : "text-red-600"}`}>
                  {member.laptop ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-secondary-foreground">Experience:</span>
                <span className={`font-semibold ${member.experience ? "text-green-600" : "text-red-600"}`}>
                  {member.experience ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Joined On:</span>
                <span className="font-medium text-foreground">{joiningDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted On:</span>
                <span className="font-medium text-foreground">{submissionDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Taken:</span>
                <span className="font-medium text-foreground">
                  {timeTakenHours}h {timeTakenMins}m
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}

"use client"

import React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export default function MemberCard({ member }) {
  const [copied, setCopied] = useState(false)

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

  const copyPhoneNumber = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(member.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joiningDate = new Date(member.startedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const age = calculateAge(member.dob)

  return (
    <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow cursor-pointer h-full">
      {/* Name */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground truncate group-hover:text-primary transition-colors">
          {member.first_name} {member.last_name}
        </h2>
      </div>

      {/* Learning Track */}
      <div className="mb-4 p-2 bg-secondary rounded inline-block">
        <span className="text-sm font-medium text-secondary-foreground">{member.learn}</span>
      </div>

      {/* Key Info */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Age:</span>
          <span className="font-medium text-foreground">{age} years</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Joined:</span>
          <span className="font-medium text-foreground">{joiningDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium text-foreground truncate max-w-[150px]">{member.email}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {member.laptop && (
          <span className="text-xs px-2 py-1 bg-accent rounded-full text-accent-foreground">Has Laptop</span>
        )}
        {member.experience && (
          <span className="text-xs px-2 py-1 bg-accent rounded-full text-accent-foreground">Experienced</span>
        )}
      </div>

      {/* Phone Copy Button */}
      <Button onClick={copyPhoneNumber} variant="outline" size="sm" className="w-full gap-2 bg-transparent">
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Phone
          </>
        )}
      </Button>
    </Card>
  )
}

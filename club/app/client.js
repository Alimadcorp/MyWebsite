'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import MemberCard from '@/components/member-card'
import { Button } from '@/components/ui/button'

export default function Client() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ submissions: 0, has_laptop: 0, has_experience: 0 })

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members')
        const data = await response.json()
        setMembers(data.data)
        setStats({
          submissions: data.submissions,
          has_laptop: data.has_laptop,
          has_experience: data.has_experience,
        })
      } catch (error) {
        console.error('Failed to fetch members:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold text-foreground">Loading members...</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Club Members</h1>
          <p className="text-muted-foreground">Manage and view all club members information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Members</div>
            <div className="text-3xl font-bold text-foreground">{stats.submissions}</div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Have Laptop</div>
            <div className="text-3xl font-bold text-foreground">{stats.has_laptop}</div>
          </Card>
          <Card className="p-6 bg-card border-border">
            <div className="text-sm font-medium text-muted-foreground mb-2">Have Experience</div>
            <div className="text-3xl font-bold text-foreground">{stats.has_experience}</div>
          </Card>
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <div key={index} className="group">
              <Link href={`/members/${member.email.split('@')[0]}`}>
                <MemberCard member={member} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

'use client'
import { useEffect, useState } from 'react'

export default function LiveStatus({ app = 'alimadhomepage' }) {
  const [count, setCount] = useState('?')
  const [online, setOnline] = useState(false)

  useEffect(() => {
    let mounted = true
    async function ping() {
      try {
        const res = await fetch(`https://live.alimad.co/ping?app=${app}`)
        const text = await res.text()
        if (res.ok && mounted) {
          setOnline(true)
          setCount(text)
        } else throw "fail"
      } catch {
        if (mounted) {
          setOnline(false)
          setCount('Offline')
        }
      }
    }
    ping()
    const id = setInterval(ping, 20000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [app])

  return (
    <>
      {online && <span className='font-semibold' style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: "all"
      }}>
        <span className='md:inline hidden'>{online ? `Online: ` : 'Offline'}</span><span>{count}</span>
      </span>}</>
  )
}
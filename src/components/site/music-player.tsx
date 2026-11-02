'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { getSiteSettings } from '@/lib/site'

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)
  const [musicUrl, setMusicUrl] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the music URL from settings via API
    fetch('/api/settings/music')
      .then(r => r.json())
      .then(d => setMusicUrl(d.musicUrl))
      .catch(() => {})
  }, [])

  // Browser autoplay policy: start on first user interaction
  useEffect(() => {
    const onFirst = () => {
      if (started || !audioRef.current || !musicUrl) return
      audioRef.current.volume = 0.35
      audioRef.current.play().then(() => {
        setStarted(true)
      }).catch(() => {
        // Silent fail; user can manually start with the toggle
      })
      window.removeEventListener('scroll', onFirst)
      window.removeEventListener('click', onFirst)
      window.removeEventListener('touchstart', onFirst)
    }
    window.addEventListener('scroll', onFirst, { once: false, passive: true })
    window.addEventListener('click', onFirst)
    window.addEventListener('touchstart', onFirst)
    return () => {
      window.removeEventListener('scroll', onFirst)
      window.removeEventListener('click', onFirst)
      window.removeEventListener('touchstart', onFirst)
    }
  }, [started, musicUrl])

  const toggle = () => {
    if (!audioRef.current) return
    if (muted) {
      audioRef.current.volume = 0.35
      setMuted(false)
    } else {
      audioRef.current.volume = 0
      setMuted(true)
    }
  }

  if (!musicUrl) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggle}
        aria-label={muted ? 'Unmute background music' : 'Mute background music'}
        className="h-11 w-11 rounded-full bg-gold/10 backdrop-blur-md border border-gold/40 flex items-center justify-center hover:bg-gold/20 transition-colors group"
      >
        {muted
          ? <VolumeX className="h-5 w-5 text-gold/60 group-hover:text-gold" />
          : <Volume2 className="h-5 w-5 text-gold group-hover:text-gold/80" />}
      </button>
      <audio ref={audioRef} src={musicUrl} loop preload="auto" />
    </div>
  )
}

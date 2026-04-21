import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { getCredentials, setCredentials, clearCredentials } from '@/lib/credentials'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onSetup?: () => void
}

export function SettingsPage({ onSetup }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const creds = getCredentials()
  const isSetup = !creds && !!onSetup
  const [token, setToken] = useState(creds?.token ?? '')
  const [dbId, setDbId] = useState(creds?.databaseId ?? '')

  function handleSave(e: FormEvent) {
    e.preventDefault()
    setCredentials(token.trim(), dbId.trim())
    queryClient.invalidateQueries({ queryKey: ['workouts'] })
    if (onSetup) {
      onSetup()
    } else {
      navigate('/')
    }
  }

  function handleDisconnect() {
    clearCredentials()
    queryClient.invalidateQueries({ queryKey: ['workouts'] })
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-3 pt-2">
        {!isSetup && (
          <button onClick={() => navigate(-1)} className="text-muted-foreground p-1 -ml-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold tracking-tight">
          {isSetup ? 'Connect Notion' : 'Settings'}
        </h1>
      </div>
      {isSetup && (
        <p className="text-sm text-muted-foreground -mt-4">
          Enter your Notion credentials to get started.
        </p>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Notion Integration Token</label>
          <Input
            placeholder="secret_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            type="password"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Database ID</label>
          <Input
            placeholder="32-character ID from your Notion URL"
            value={dbId}
            onChange={(e) => setDbId(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
          <p className="text-xs text-muted-foreground">
            Open your Notion database, click Share → Copy link. The ID is the 32-char string before the "?".
          </p>
        </div>
        <Button type="submit" disabled={!token.trim() || !dbId.trim()}>
          Save
        </Button>
      </form>

      {creds && (
        <button
          onClick={handleDisconnect}
          className="text-sm text-destructive text-center py-2"
        >
          Disconnect Notion
        </button>
      )}
    </div>
  )
}

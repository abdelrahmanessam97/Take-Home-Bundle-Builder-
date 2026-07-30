import { useEffect, useState } from 'react'
import { BuilderAccordion } from './components/BuilderAccordion'
import { ReviewPanel } from './components/ReviewPanel'
import { Spinner } from './components/Spinner'
import { useBundleState, resolveInitialBundle } from './hooks/useBundleState'
import { loadAppData, resetAppDataLoad } from './lib/catalog'
import type { BootState, BundleAppProps } from './types'
import './App.css'
import './styles/review.css'
import './styles/plan.css'

function BundleApp({ initial }: BundleAppProps) {
  const bundle = useBundleState(initial)
  const { meta } = bundle.catalog

  return (
    <div className="App">
      <div className="app-shell">
        <header className="app-intro">
          <h1 className="app-intro__title">{meta.appTitle}</h1>
        </header>
        <div className="app-layout">
          <main className="app-layout__builder" aria-label={meta.builderAriaLabel}>
            <BuilderAccordion bundle={bundle} />
          </main>
          <div className="app-layout__review">
            <ReviewPanel bundle={bundle} />
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [initial, setInitial] = useState<BootState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        setError(null)
        const { catalog, bundle } = await loadAppData()
        const normalized = resolveInitialBundle(catalog, bundle)
        if (!cancelled) setInitial(normalized)
      } catch {
        if (!cancelled) {
          setInitial(null)
          setError(
            'Could not load data from the server. Check that the API is running, then retry.',
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [retryKey])

  if (error) {
    return (
      <div className="App">
        <div className="app-shell app-shell--loading" role="alert">
          <div className="app-boot-error">
            <p>{error}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                resetAppDataLoad()
                setRetryKey((k) => k + 1)
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!initial) {
    return (
      <div className="App">
        <div
          className="app-shell app-shell--loading"
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <Spinner size="lg" label="Loading catalog…" />
        </div>
      </div>
    )
  }

  return <BundleApp initial={initial} />
}

export default App

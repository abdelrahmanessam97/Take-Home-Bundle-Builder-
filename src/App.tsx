import { useEffect, useState } from 'react'
import { BuilderAccordion } from './components/BuilderAccordion'
import { ReviewPanel } from './components/ReviewPanel'
import { useBundleState } from './hooks/useBundleState'
import { loadCatalog } from './lib/catalog'
import './App.css'
import './styles/review.css'
import './styles/plan.css'

function BundleApp() {
  const bundle = useBundleState()
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
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void loadCatalog().finally(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return (
      <div className="App">
        <div
          className="app-shell app-shell--loading"
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <span className="app-spinner" aria-hidden="true" />
          <span className="sr-only">Loading catalog…</span>
        </div>
      </div>
    )
  }

  return <BundleApp />
}

export default App

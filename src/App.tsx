import { BuilderAccordion } from './components/BuilderAccordion'
import { ReviewPanel } from './components/ReviewPanel'
import { useBundleState } from './hooks/useBundleState'
import './App.css'
import './styles/review.css'
import './styles/plan.css'

function App() {
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

export default App

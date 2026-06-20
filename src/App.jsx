import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import ExpensesScreen from './screens/ExpensesScreen.jsx'
import SummaryScreen from './screens/SummaryScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import AddExpenseScreen from './screens/AddExpenseScreen.jsx'
import ExpenseDetailScreen from './screens/ExpenseDetailScreen.jsx'

export default function App() {
  const [tab, setTab] = useState('expenses')
  // overlay: null | { type: 'add' } | { type: 'detail', id }
  const [overlay, setOverlay] = useState(null)

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-gray-300 flex justify-center dark:bg-black">
      <div className="relative w-full max-w-full sm:max-w-[640px] lg:max-w-[720px] h-[100dvh] bg-gray-50 shadow-2xl overflow-hidden flex flex-col dark:bg-gray-950">
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {tab === 'expenses' && (
            <ExpensesScreen
              onOpen={(id) => setOverlay({ type: 'detail', id })}
              onGoSettings={() => setTab('settings')}
            />
          )}
          {tab === 'summary' && (
            <SummaryScreen onGoSettings={() => setTab('settings')} />
          )}
          {tab === 'settings' && <SettingsScreen />}
        </main>

        <BottomNav
          tab={tab}
          setTab={setTab}
          onAdd={() => setOverlay({ type: 'add' })}
        />

        {overlay?.type === 'add' && (
          <AddExpenseScreen
            onClose={() => setOverlay(null)}
            onGoSettings={() => {
              setOverlay(null)
              setTab('settings')
            }}
          />
        )}

        {overlay?.type === 'detail' && (
          <ExpenseDetailScreen
            id={overlay.id}
            onClose={() => setOverlay(null)}
          />
        )}
      </div>
    </div>
  )
}

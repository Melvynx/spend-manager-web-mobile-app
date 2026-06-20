import { Receipt, PieChart, Settings, Plus } from 'lucide-react'

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
        active
          ? 'text-indigo-600 dark:text-indigo-400'
          : 'text-gray-400 dark:text-gray-500'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  )
}

export default function BottomNav({ tab, setTab, onAdd }) {
  return (
    <nav className="relative z-20 h-16 bg-white border-t border-gray-200 grid grid-cols-4 items-stretch pb-[env(safe-area-inset-bottom)] dark:bg-gray-900 dark:border-gray-800">
      <TabButton
        active={tab === 'expenses'}
        onClick={() => setTab('expenses')}
        icon={Receipt}
        label="Expenses"
      />
      <TabButton
        active={tab === 'summary'}
        onClick={() => setTab('summary')}
        icon={PieChart}
        label="Summary"
      />
      <TabButton active={false} onClick={onAdd} icon={Plus} label="Add" />
      <TabButton
        active={tab === 'settings'}
        onClick={() => setTab('settings')}
        icon={Settings}
        label="Settings"
      />
    </nav>
  )
}

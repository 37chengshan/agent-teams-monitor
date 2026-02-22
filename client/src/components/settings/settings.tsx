'use client'

import { memo } from 'react'
import { useSettingsStore } from '@/lib/stores/settings-store'
import {
  Bell,
  Moon,
  Sun,
} from 'lucide-react'

function SettingsSection({
  title,
  icon: Icon,
  children,
  isLight,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  isLight: boolean
}) {
  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm ${
      isLight
        ? 'bg-white border-gray-200'
        : 'bg-background-secondary border-slate-700'
    }`}>
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${
        isLight ? 'border-gray-100' : 'border-slate-700'
      }`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isLight ? 'bg-primary/5' : 'bg-primary/20'
        }`}>
          <Icon className={`w-5 h-5 ${isLight ? 'text-primary' : 'text-accent-primary'}`} />
        </div>
        <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-slate-200'}`}>{title}</span>
      </div>
      <div className="px-5 py-4 space-y-4">
        {children}
      </div>
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  isLight,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  isLight: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>{label}</div>
        {description && <div className={`text-xs ${isLight ? 'text-gray-500' : 'text-slate-400'} mt-0.5`}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
          checked ? 'bg-primary' : isLight ? 'bg-gray-200' : 'bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function ThemeToggle({
  value,
  onChange,
  isLight,
}: {
  value: string
  onChange: (value: 'dark' | 'light' | 'system') => void
  isLight: boolean
}) {
  const themes = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
  ] as const

  return (
    <div>
      <div className={`text-sm font-medium mb-3 ${isLight ? 'text-gray-700' : 'text-slate-200'}`}>选择主题</div>
      <div className="flex gap-2">
        {themes.map((theme) => (
          <button
            key={theme.value}
            onClick={() => onChange(theme.value as 'dark' | 'light' | 'system')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              value === theme.value
                ? isLight
                  ? 'bg-primary text-black shadow-md'
                  : 'bg-primary text-white shadow-md'
                : isLight
                  ? 'bg-gray-200 text-black hover:bg-gray-300'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            <theme.icon className="w-4 h-4" />
            {theme.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const Settings = memo(function Settings() {
  const store = useSettingsStore()
  const isLight = store.theme === 'light'

  const handleReset = () => {
    if (confirm('确定要恢复默认设置吗？')) {
      store.resetSettings()
    }
  }

  return (
    <div className={`h-full overflow-y-auto p-6 w-full min-w-0 ${
      isLight ? 'bg-gray-50' : 'bg-background-primary'
    }`}>
      <div className="max-w-xl mx-auto space-y-6 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-display font-bold ${isLight ? 'text-gray-900' : 'text-slate-100'}`}>设置</h1>
            <p className={`text-sm ${isLight ? 'text-gray-500' : 'text-slate-400'} mt-1`}>自定义您的使用体验</p>
          </div>
          <button
            onClick={handleReset}
            className={`text-sm px-3 py-2 rounded-lg transition-colors ${
              isLight
                ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-background-tertiary'
            }`}
          >
            恢复默认
          </button>
        </div>

        <SettingsSection title="主题" icon={Sun} isLight={isLight}>
          <ThemeToggle
            value={store.theme}
            onChange={(value) => store.setTheme(value as 'dark' | 'light')}
            isLight={isLight}
          />
        </SettingsSection>

        <SettingsSection title="消息通知" icon={Bell} isLight={isLight}>
          <ToggleSwitch
            checked={store.autoScroll}
            onChange={store.setAutoScroll}
            label="自动滚动"
            description="新消息自动滚动到底部"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.soundEnabled}
            onChange={store.setSoundEnabled}
            label="消息提示音"
            description="收到新消息时播放提示音"
            isLight={isLight}
          />
          <ToggleSwitch
            checked={store.desktopNotifications}
            onChange={store.setDesktopNotifications}
            label="桌面通知"
            description="在桌面显示通知提醒"
            isLight={isLight}
          />
        </SettingsSection>
      </div>
    </div>
  )
})

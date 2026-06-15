import { useState } from 'react'
import type { ReactNode } from 'react'
import { Screen } from '../components/layout/Screen'
import {
  Badge,
  Button,
  Chip,
  Confetti,
  ProgressBar,
  StickerCard,
  TeamSticker,
} from '../components/ui'
import { color, radius, shadow, space, typography } from '../design/tokens'
import { getTeam } from '../data/worldCup2026'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: space[8] }}>
      <h3
        style={{
          fontFamily: typography.family.display,
          fontSize: typography.size.lg,
          textTransform: 'uppercase',
          marginBottom: space[3],
          color: color.ink.base,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  )
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          height: 52,
          borderRadius: radius.md,
          background: value,
          border: '2px solid rgba(43,34,24,0.18)',
          boxShadow: shadow.sm,
        }}
      />
      <div style={{ fontSize: 11, marginTop: 4, color: color.ink.soft }}>{name}</div>
    </div>
  )
}

const swatchGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: space[3],
}

export function StyleGuide() {
  const [confetti, setConfetti] = useState(false)
  const sample = getTeam('BRA')
  const sample2 = getTeam('ARG')

  return (
    <Screen title="Style Guide" back="/">
      {confetti && <Confetti />}
      <p className="wc-eyebrow">Sticker Cup '26 · design system</p>

      <Section title="Brand colors">
        <div style={swatchGrid}>
          {Object.entries(color.accent).map(([k, v]) => (
            <Swatch key={k} name={k} value={v} />
          ))}
          {Object.entries(color.foil).map(([k, v]) => (
            <Swatch key={k} name={`foil ${k}`} value={v} />
          ))}
        </div>
      </Section>

      <Section title="Paper & ink">
        <div style={swatchGrid}>
          {Object.entries(color.paper).map(([k, v]) => (
            <Swatch key={k} name={`paper ${k}`} value={v} />
          ))}
          {Object.entries(color.ink).map(([k, v]) => (
            <Swatch key={k} name={`ink ${k}`} value={v} />
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
          <h1 style={{ fontSize: typography.size['4xl'] }}>Sticker Cup</h1>
          <h2 style={{ fontSize: typography.size['2xl'] }}>Quarter Finals</h2>
          <p style={{ fontSize: typography.size.base }}>
            Body copy in DM Sans — clean and legible at small sizes for match
            details and helper text.
          </p>
          <p className="wc-eyebrow">Eyebrow label · all caps</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[3] }}>
          <Button variant="primary">Primary</Button>
          <Button variant="gold">Gold</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Badges & chips">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
          <Badge>A</Badge>
          <Badge tone="red">B</Badge>
          <Badge tone="blue">C</Badge>
          <Badge tone="gold">1</Badge>
          <Badge tone="green">2</Badge>
          <Chip>Group Stage</Chip>
          <Chip tone="solid">Round of 32</Chip>
          <Chip tone="gold">Final</Chip>
          <Chip tone="green">Advancing</Chip>
        </div>
      </Section>

      <Section title="Sticker cards">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space[3] }}>
          <StickerCard style={{ padding: space[4] }}>Default sticker</StickerCard>
          <StickerCard peel style={{ padding: space[4] }}>
            Peeled corner
          </StickerCard>
          <StickerCard foil style={{ padding: space[4] }}>
            Gold foil (champion)
          </StickerCard>
          <StickerCard interactive style={{ padding: space[4] }}>
            Interactive
          </StickerCard>
        </div>
      </Section>

      <Section title="Team stickers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: space[2] }}>
          <TeamSticker team={sample} meta="Pick" onClick={() => {}} />
          <TeamSticker team={sample2} picked />
          <TeamSticker team={getTeam('QAT')} eliminated />
          <TeamSticker emptyLabel="Winner Group A" />
        </div>
      </Section>

      <Section title="Progress">
        <ProgressBar total={12} completed={7} label="Groups picked" />
      </Section>

      <Section title="Confetti">
        <Button
          variant="gold"
          onClick={() => {
            setConfetti(false)
            requestAnimationFrame(() => setConfetti(true))
          }}
        >
          🎉 Fire confetti
        </Button>
      </Section>

      <div style={{ height: space[16] }} />
    </Screen>
  )
}

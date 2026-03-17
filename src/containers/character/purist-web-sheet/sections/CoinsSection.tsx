type CoinsSectionProps = {
  gp: string
}

const COINS = ['PP', 'GP', 'EP', 'SP', 'CP'] as const

export default function CoinsSection({ gp }: CoinsSectionProps) {
  return (
    <>
      <div className="ps-sec-hdr" style={{ left: 'var(--ps-col3)', top: 'calc(var(--ps-p2-bot-top) - var(--ps-hdr-gap))' }}>
        Coins
      </div>

      {COINS.map((coin, i) => (
        <div
          key={coin}
          className="ps-row"
          style={{ left: 'var(--ps-col3)', top: `calc(var(--ps-p2-bot-top) + ${i} * var(--ps-stride))` }}
        >
          <div className="ps-lbl">{coin}</div>
          <div className="ps-inp" style={{ width: 'var(--ps-inp-coins)' }}>
            <input type="text" defaultValue={coin === 'GP' ? gp : undefined} />
          </div>
        </div>
      ))}
    </>
  )
}

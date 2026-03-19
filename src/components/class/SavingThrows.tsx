import type { ClassOptionsData } from '../../types'

type SavingThrowsProps = {
  characterClass: ClassOptionsData
}

export default function SavingThrows({ characterClass }: SavingThrowsProps) {
  const saves = characterClass.getSavingThrowsAtLevel(1)
  return (
    <div className='saving-throws container'>
      <div className='saving-throw--death saving-throw-name'>Death </div>
      <div className='saving-throw--death--value saving--value'>
        {saves[0]}
      </div>
      <div className='saving-throw--wands saving-throw-name'>Wands </div>
      <div className='saving-throw--wands--value saving--value'>
        {saves[1]}
      </div>
      <div className='saving-throw--paralysis saving-throw-name'>
        Paralysis{' '}
      </div>
      <div className='saving-throw--paralysis--value saving--value'>
        {saves[2]}
      </div>
      <div className='saving-throw--breath saving-throw-name'>Breath</div>
      <div className='saving-throw--breath--value saving--value'>
        {saves[3]}
      </div>
      <div className='saving-throw--spells saving-throw-name'>Spells </div>
      <div className='saving-throw--spells--value saving--value'>
        {saves[4]}
      </div>
    </div>
  )
}




type CheckboxProps = {
  value: string
  checkedCondition: boolean
  callback: () => void
}

export default function Checkbox(props: CheckboxProps) {
  const { value, checkedCondition, callback } = props

  return (
    <input
      type='checkbox'
      value={value}
      className={`checkbox --${value}`}
      checked={checkedCondition}
      onChange={() => callback()}
    ></input>
  )
}



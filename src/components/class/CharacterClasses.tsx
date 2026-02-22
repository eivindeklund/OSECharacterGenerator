import React from 'react'

type CharacterClassesProps = {
  callback: (classType: string) => React.ReactNode
  classType: string
}

export default function CharacterClasses(props: CharacterClassesProps) {
  const { callback, classType } = props
  return (
    <div className={`container class-container class-container--${classType}`}>
      {callback(classType)}
    </div>
  )
}



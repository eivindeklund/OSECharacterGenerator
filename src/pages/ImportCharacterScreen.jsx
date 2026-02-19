import PropTypes from 'prop-types';

export default function ImportCharacterScreen({ characterData, onConfirm, onCancel }) {
  if (!characterData || !characterData.character || !characterData.characterClass || !characterData.characterStatistics || !characterData.abilityScores) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 className="header-default">Error</h2>
        <p>Invalid character data provided.</p>
        <button className="button" onClick={onCancel}>Go Back</button>
      </div>
    );
  }

  const { character, characterClass, characterStatistics, abilityScores } = characterData;
  const name = character.name || 'Unnamed Character';
  const className = characterClass.name || 'Unknown Class';
  const hp = characterStatistics.hitPoints;
  const ac = characterStatistics.armourClass;

  const scores = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'];

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2 className="header-default">Import Character</h2>
      
      <div className="import-summary" style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', background: 'rgba(255,255,255,0.8)', margin: '20px auto', maxWidth: '500px' }}>
        <h3>{name}</h3>
        <p><strong>Class:</strong> {className}</p>
        <p><strong>HP:</strong> {hp} | <strong>AC:</strong> {ac}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', margin: '20px 0' }}>
           {scores.map(k => (
             <div key={k}>
               <strong>{k.substring(0,3).toUpperCase()}:</strong> {abilityScores[k]}
             </div>
           ))}
        </div>

        <p>Do you want to import this character?</p>
      </div>

      <div className="button-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button className="button-primary" onClick={onConfirm}>Import</button>
        <button className="button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

ImportCharacterScreen.propTypes = {
  characterData: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

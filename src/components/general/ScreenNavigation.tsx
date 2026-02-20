import PropTypes from "prop-types";

export default function ScreenNavigation(props) {
  const {
    onNext,
    onPrev,
    onNavigation,
    nextLabel,
    prevLabel,
    nextDisabled,
    requirements,
  } = props;

  const isDisabled =
    nextDisabled !== undefined
      ? nextDisabled
      : requirements && requirements.length > 0;

  const handleNext = () => {
    if (onNavigation) {
      onNavigation();
    }
    if (onNext) {
      onNext();
    }
  };

  const handlePrev = () => {
    if (onNavigation) {
      onNavigation();
    }
    if (onPrev) {
      onPrev();
    }
  };

  return (
    <div className="screen-navigation-container">
      {isDisabled && requirements && requirements.length > 0 && (
        <div className="requirement-messages">
          {requirements.map((req, index) => (
            <div key={index} className="requirement-message">
              {req}
            </div>
          ))}
        </div>
      )}
      <div className="navigation-buttons">
        <div className="navigation-prev-container">
          {onPrev && (
            <button className="button button-secondary" onClick={handlePrev}>
              {prevLabel ? `< ${prevLabel}` : "< Back"}
            </button>
          )}
        </div>
        <div className="navigation-next-container">
          {onNext && (
            <button
              className="button button-primary"
              onClick={handleNext}
              disabled={isDisabled}
              style={isDisabled ? { opacity: 0.4 } : {}}
            >
              {nextLabel ? `${nextLabel} >` : "Next >"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

ScreenNavigation.propTypes = {
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  onNavigation: PropTypes.func,
  nextLabel: PropTypes.string,
  prevLabel: PropTypes.string,
  nextDisabled: PropTypes.bool,
  requirements: PropTypes.arrayOf(PropTypes.string),
};

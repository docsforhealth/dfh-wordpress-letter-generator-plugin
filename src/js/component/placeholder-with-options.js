import { Placeholder } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';

export default function PlaceholderWithOptions({
  className,
  icon,
  label,
  instructions,
  options,
}) {
  return (
    <Placeholder
      icon={icon}
      label={label}
      instructions={instructions}
      className={`placeholder-with-options ${className ?? ''}`}
    >
      <ul className="placeholder-with-options__list">
        {options?.map((option, index) => (
          <li key={index} className="placeholder-with-options__option">
            <button
              type="button"
              className="placeholder-with-options__option__container"
              onClick={() => option.onSelect?.call(null, option)}
            >
              <span className="placeholder-with-options__option__title">
                {option.icon && (
                  <Icon
                    icon={option.icon}
                    className="placeholder-with-options__option__icon"
                  />
                )}
                {option.label}
              </span>
              <span className="placeholder-with-options__option__description">
                {option.description}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Placeholder>
  );
}
PlaceholderWithOptions.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.element,
  label: PropTypes.string.isRequired,
  instructions: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.element,
      label: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      onSelect: PropTypes.func.isRequired,
    }),
  ),
};

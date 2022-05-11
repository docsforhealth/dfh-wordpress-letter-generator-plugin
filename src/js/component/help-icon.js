import { Tooltip } from '@wordpress/components';
import { help, Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';

// TODO styling

export default function HelpIcon({ text }) {
  return (
    <Tooltip text={text} aria-label={text}>
      <span>
        <Icon icon={help} />
      </span>
    </Tooltip>
  );
}
HelpIcon.propTypes = {
  text: PropTypes.node.isRequired,
};

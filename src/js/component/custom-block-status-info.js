import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';

export default function CustomBlockStatusInfo({ validMessage, errors }) {
  return errors?.length ? (
    <div className="custom-block-status-info custom-block-status-info--invalid">
      <h3 className="custom-block-status-info__title">
        {__('Errors', Constants.TEXT_DOMAIN)}
      </h3>
      {errors.length ? (
        // Only show list if multiple errors
        <ol>
          {errors.map((errorMessage, index) => (
            <li key={index}>{errorMessage}</li>
          ))}
        </ol>
      ) : (
        errorMessage
      )}
    </div>
  ) : (
    <div className="custom-block-status-info">{validMessage}</div>
  );
}
CustomBlockStatusInfo.propTypes = {
  validMessage: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};

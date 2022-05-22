import { useSelect } from '@wordpress/data';
import { createContext, useEffect, useState } from '@wordpress/element';
import { debounce, identity, isEqual, isFunction, noop } from 'lodash';
import merge from 'lodash.merge';
import * as Constants from 'src/js/constants';
import { API_CONFIG_API_DATA, buildApiData } from 'src/js/utils/api';

export const AdditionalApiDataContext = createContext({
  additionalApiData: null,
  updateAdditionalApiData: noop,
});

// Define a function with with this key on the options object passed to the `withApiData` function
// which will will be passed (1) the new generated API data and (2) any additional data set in
// the `AdditionalApiDataContext` context This function is expected to return the API data object
export const KEY_CUSTOMIZE_API_DATA = '_withApiData_CUSTOMIZE_API_DATA';

export default function withApiData(options) {
  const customizeApiData = isFunction(options[KEY_CUSTOMIZE_API_DATA])
    ? options[KEY_CUSTOMIZE_API_DATA]
    : identity;
  return merge({}, options, {
    attributes: {
      [API_CONFIG_API_DATA]: { type: 'object' },
    },
    edit(props) {
      const Edit = options.edit,
        { attributes, setAttributes, clientId } = props,
        [additionalApiData, updateAdditionalApiData] = useState(null),
        thisBlockInfo = useSelect((select) =>
          select(Constants.STORE_BLOCK_EDITOR).getBlock(clientId),
        );
      useEffect(() => {
        tryUpdateApiData(
          thisBlockInfo,
          (newApiData) => customizeApiData(newApiData, additionalApiData),
          attributes[API_CONFIG_API_DATA],
          (apiData) => setAttributes({ [API_CONFIG_API_DATA]: apiData }),
        );
        return tryUpdateApiData.cancel;
      }, [thisBlockInfo, additionalApiData]);
      return (
        <AdditionalApiDataContext.Provider
          value={{ additionalApiData, updateAdditionalApiData }}
        >
          <Edit {...props} />;
        </AdditionalApiDataContext.Provider>
      );
    },
  });
}

/////////////
// Helpers //
/////////////

const tryUpdateApiData = debounce(
  (blockInfo, customizeApiData, oldApiData, updateApiData) => {
    const newApiData = customizeApiData(buildApiData(blockInfo));
    if (!isEqual(oldApiData, newApiData)) {
      updateApiData(newApiData);
    }
  },
  500,
);

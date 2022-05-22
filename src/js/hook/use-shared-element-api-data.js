import { useSelect } from '@wordpress/data';
import { map } from 'lodash';
import * as Constants from 'src/js/constants';

/**
 * Retrieves API data for shared data elements
 * @param  {?Object} options        Optional, retrieval options
 * @param  {?String} options.search Optional, string to search for
 * @param  {?Array} dependencies    Optional, array of dependency values for `useSelect`
 * @return {Array}              Array of API data for shared data elements
 */
export default function useSharedElementApiData(
  options = {},
  dependencies = null,
) {
  const requestOptions = {
    ...(options ?? {}),
    context: Constants.API_CONTEXT_VIEW,
    status: Constants.POST_STATUS_PUBLISHED,
  };
  // when selecting shared data elements, leverage the built-in search functionality of the WP API
  if (options?.search) {
    // Need to ensure that search term is properly encoded
    requestOptions.search = encodeURIComponent(options.search);
  }
  // Start AJAX request to fetch shared data elements and return with request status boolean
  return useSelect((select) => {
    const { hasFinishedResolution } = select(Constants.STORE_CORE_DATA),
      storeRequestArgs = [
        Constants.ENTITY_KIND_POST_TYPE,
        Constants.CONTENT_TYPE_SHARED_DATA_ELEMENT,
        requestOptions,
      ];
    return [
      // 1. select all the shared data element pages
      // 2. extract the custom `data` property, see `content_type_shared_data_element.php`
      map(
        select(Constants.STORE_CORE).getEntityRecords(...storeRequestArgs),
        'data',
      ),
      // see https://unfoldingneurons.com/2020/wordpress-data-store-properties-resolvers
      hasFinishedResolution(
        Constants.STORE_CORE,
        'getEntityRecords',
        storeRequestArgs,
      ),
    ];
  }, dependencies);
}
